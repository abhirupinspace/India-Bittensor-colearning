---
title: 'SN41: Programmatic Trade Execution'
sidebar_position: 5
description: 'Implement the miner prediction handler: receive validator queries, integrate sports data APIs (Odds API, Sportradar), return prediction + confidence, plus error handling and observability.'
---

# SN41: Programmatic Trade Execution

:::info What You'll Do
After this section you will:
- Understand the **request/response shape** between validators and miners on SN41
- Implement a **prediction handler** in Python with a clean architecture
- Integrate with a **sports data API** (The Odds API / Sportradar / scraping Pinnacle conceptually)
- Handle **timeouts, rate limits, and errors** gracefully
- Add **structured logging** so you can debug performance
- Have a baseline prediction that validators can score (before improving the strategy in the trading-strategies section)
:::

:::note Prerequisites
- ✅ [Running the SN41 Miner](./running-the-sn41-miner) complete: miner running, validator queries arriving
- ✅ Python fundamentals (async, dataclass, try/except)
- ✅ Access to at least **one sports data API** (The Odds API free tier: [the-odds-api.com](https://the-odds-api.com))
:::

---

## Validator ↔ Miner Protocol Shape

Bittensor uses **bt.Synapse** (a dataclass object) to serialize requests/responses. Sportstensor defines specific synapses: the conceptual structure:

```mermaid
sequenceDiagram
    participant V as Validator
    participant M as Miner (axon)
    participant H as PredictionHandler
    participant D as Data Provider API

    V->>M: Synapse(event_id, sport, teams, kickoff)
    M->>H: forward(synapse)
    H->>D: fetch odds + stats
    D-->>H: market data
    H->>H: run model
    H-->>M: Synapse(prediction, confidence)
    M-->>V: Synapse(response)
    Note over V: validator logs & later scores
```

### Request (From the Validator)

```python
# Example shape (exact fields: see official sportstensor repo docs)
class PredictionRequest(bt.Synapse):
    event_id: str              # "mlb_2026_04_14_NYY_BOS"
    sport: str                 # "mlb" / "nba" / "nfl" / "soccer"
    home_team: str             # "NYY"
    away_team: str             # "BOS"
    kickoff_utc: str           # ISO8601
    league: str | None = None
    # response fields
    prediction: dict | None = None
    confidence: float | None = None
```

### Response (From the Miner)

`prediction` dict common format:

```python
{
  "home_win": 0.58,
  "away_win": 0.35,
  "draw": 0.07,              # for sports that support draw
  "total_over_under": 8.5,   # optional, certain sports
  "stake_suggestion": 0.02   # Kelly fraction, optional
}
```

`confidence` float `[0.0, 1.0]`: how confident your model is.

:::warning Exact Shape Can Change
Check `synapse.py` or `protocol.py` in the Sportstensor repo for the exact fields and types. The example above is a generic template. **Always check the official docs**.
:::

---

## Step 1: Scaffold the Handler

Folder structure to create:

```text
sportstensor/
├── neurons/
│   └── miner.py            (already exists: entrypoint)
├── src/
│   ├── handler.py          (NEW: orchestrator)
│   ├── predictors/
│   │   ├── baseline.py     (NEW: simple implied-odds)
│   │   └── registry.py     (NEW: pick predictor per sport)
│   └── data/
│       ├── odds_api.py     (NEW: The Odds API wrapper)
│       └── cache.py        (NEW: in-memory LRU)
└── tests/
    └── test_handler.py
```

### `src/data/odds_api.py`

```python
"""Wrapper for The Odds API (https://the-odds-api.com).
Free tier: 500 requests/month: enough for dev, upgrade for production.
"""
from __future__ import annotations
import os
import time
import logging
from typing import Any
import httpx

log = logging.getLogger(__name__)

BASE_URL = "https://api.the-odds-api.com/v4"


class OddsAPIClient:
    def __init__(self, api_key: str | None = None, timeout: float = 4.0):
        self.api_key = api_key or os.getenv("ODDS_API_KEY")
        if not self.api_key:
            raise RuntimeError("ODDS_API_KEY not set in env")
        self.timeout = timeout
        self._client = httpx.Client(timeout=timeout)

    def get_event_odds(
        self,
        sport_key: str,
        event_id: str,
        regions: str = "us,eu",
        markets: str = "h2h",
    ) -> dict[str, Any] | None:
        """Fetch odds for a single event. Return None if not found."""
        url = f"{BASE_URL}/sports/{sport_key}/events/{event_id}/odds"
        params = {"apiKey": self.api_key, "regions": regions, "markets": markets}
        try:
            r = self._client.get(url, params=params)
            r.raise_for_status()
            return r.json()
        except httpx.HTTPStatusError as e:
            log.warning("OddsAPI HTTP %s for %s", e.response.status_code, event_id)
            return None
        except httpx.TimeoutException:
            log.warning("OddsAPI timeout for %s", event_id)
            return None
        except Exception as e:
            log.exception("OddsAPI unexpected error: %s", e)
            return None
```

### `src/data/cache.py`

```python
"""Simple TTL cache so we don't hit the data API repeatedly for the same validator query."""
from __future__ import annotations
import time
from collections import OrderedDict
from typing import Any


class TTLCache:
    def __init__(self, max_size: int = 1024, ttl_seconds: int = 60):
        self.max_size = max_size
        self.ttl = ttl_seconds
        self._d: OrderedDict[str, tuple[float, Any]] = OrderedDict()

    def get(self, key: str) -> Any | None:
        item = self._d.get(key)
        if not item:
            return None
        ts, val = item
        if time.time() - ts > self.ttl:
            self._d.pop(key, None)
            return None
        self._d.move_to_end(key)
        return val

    def set(self, key: str, value: Any) -> None:
        self._d[key] = (time.time(), value)
        self._d.move_to_end(key)
        while len(self._d) > self.max_size:
            self._d.popitem(last=False)
```

---

## Step 2: Baseline Predictor

A simple baseline that converts odds to **implied probability** then normalizes. Won't beat the market, but it's a safe fallback and starting point.

### `src/predictors/baseline.py`

```python
"""Baseline predictor: implied probability from market odds (h2h).
If the market is efficient, this is enough to get neutral-ish CLV.
Improve later with ML / feature engineering.
"""
from __future__ import annotations
import logging
from typing import Any

log = logging.getLogger(__name__)


def american_to_prob(odds: int) -> float:
    """Convert American odds to implied probability."""
    if odds >= 100:
        return 100 / (odds + 100)
    return -odds / (-odds + 100)


def decimal_to_prob(odds: float) -> float:
    return 1.0 / odds


def normalize(probs: dict[str, float]) -> dict[str, float]:
    """Strip the bookmaker margin (vig), scale to sum=1."""
    s = sum(probs.values())
    if s <= 0:
        return probs
    return {k: v / s for k, v in probs.items()}


def predict_from_odds(odds_payload: dict[str, Any]) -> dict[str, float] | None:
    """Extract best h2h odds from multiple bookmakers, return normalized probs."""
    if not odds_payload or "bookmakers" not in odds_payload:
        return None

    # Simple: average decimal odds across all bookmakers
    home_odds, away_odds, draw_odds = [], [], []
    for bm in odds_payload["bookmakers"]:
        for market in bm.get("markets", []):
            if market["key"] != "h2h":
                continue
            for o in market["outcomes"]:
                name = o["name"]
                price = o["price"]  # assume decimal
                if name == odds_payload.get("home_team"):
                    home_odds.append(price)
                elif name == odds_payload.get("away_team"):
                    away_odds.append(price)
                else:
                    draw_odds.append(price)

    if not home_odds or not away_odds:
        log.warning("Insufficient odds data for %s", odds_payload.get("id"))
        return None

    probs = {
        "home_win": sum(decimal_to_prob(o) for o in home_odds) / len(home_odds),
        "away_win": sum(decimal_to_prob(o) for o in away_odds) / len(away_odds),
    }
    if draw_odds:
        probs["draw"] = sum(decimal_to_prob(o) for o in draw_odds) / len(draw_odds)

    return normalize(probs)
```

### `src/predictors/registry.py`

```python
"""Router: pick a predictor based on sport."""
from __future__ import annotations
from .baseline import predict_from_odds


PREDICTORS = {
    "mlb": predict_from_odds,
    "nba": predict_from_odds,
    "nfl": predict_from_odds,
    "soccer": predict_from_odds,
}


def get_predictor(sport: str):
    return PREDICTORS.get(sport.lower(), predict_from_odds)
```

---

## Step 3: Main Handler (Orchestrator)

### `src/handler.py`

```python
"""PredictionHandler: called from neurons/miner.py forward().
Timeout budget: ~2 seconds total (validators typically time out at 3–5s).
"""
from __future__ import annotations
import asyncio
import logging
import time
from typing import Any

from .data.odds_api import OddsAPIClient
from .data.cache import TTLCache
from .predictors.registry import get_predictor

log = logging.getLogger(__name__)

SPORT_KEY_MAP = {
    "mlb": "baseball_mlb",
    "nba": "basketball_nba",
    "nfl": "americanfootball_nfl",
    "soccer": "soccer_epl",   # example EPL; extend per league
}


class PredictionHandler:
    def __init__(self):
        self.odds = OddsAPIClient()
        self.cache = TTLCache(max_size=2048, ttl_seconds=45)

    def handle(self, req: Any) -> dict[str, Any]:
        """Main entry. Input: PredictionRequest synapse. Output: dict response."""
        t0 = time.monotonic()
        event_id = getattr(req, "event_id", "unknown")
        sport = getattr(req, "sport", "unknown")

        try:
            # 1. cache check
            cache_key = f"{sport}:{event_id}"
            cached = self.cache.get(cache_key)
            if cached:
                log.debug("Cache hit for %s", cache_key)
                return cached

            # 2. fetch data
            sport_key = SPORT_KEY_MAP.get(sport.lower())
            if not sport_key:
                return self._fallback(reason=f"unsupported sport {sport}")

            odds_payload = self.odds.get_event_odds(sport_key, event_id)
            if not odds_payload:
                return self._fallback(reason="odds_api_miss")

            # attach team names to payload for predictor
            odds_payload.setdefault("home_team", getattr(req, "home_team", None))
            odds_payload.setdefault("away_team", getattr(req, "away_team", None))

            # 3. predict
            predictor = get_predictor(sport)
            probs = predictor(odds_payload)
            if not probs:
                return self._fallback(reason="predictor_none")

            # 4. compute confidence: spread between top pick and runner-up
            sorted_probs = sorted(probs.values(), reverse=True)
            confidence = min(1.0, (sorted_probs[0] - sorted_probs[1]) * 2) if len(sorted_probs) >= 2 else 0.5

            response = {
                "prediction": probs,
                "confidence": round(confidence, 3),
                "stake_suggestion": round(min(0.05, confidence * 0.1), 4),
            }

            self.cache.set(cache_key, response)
            elapsed_ms = int((time.monotonic() - t0) * 1000)
            log.info("Predicted %s in %dms: %s (conf=%.2f)",
                     event_id, elapsed_ms, probs, confidence)
            return response

        except Exception as e:
            log.exception("Handler crash for %s: %s", event_id, e)
            return self._fallback(reason="exception")

    def _fallback(self, reason: str) -> dict[str, Any]:
        """If anything fails, return uniform prior + confidence 0.
        Uniform prior = doesn't hurt scoring (50/50 or 33/33/33).
        Confidence 0 = validator knows we're not sure."""
        log.warning("Fallback triggered: %s", reason)
        return {
            "prediction": {"home_win": 0.5, "away_win": 0.5},
            "confidence": 0.0,
            "stake_suggestion": 0.0,
        }
```

---

## Step 4: Wire to `neurons/miner.py`

Edit the miner's `forward()` function (exact signature per the repo: typically like this):

```python
# neurons/miner.py (excerpt)
from src.handler import PredictionHandler

class Miner(BaseNeuron):
    def __init__(self, config=None):
        super().__init__(config)
        self.handler = PredictionHandler()

    async def forward(self, synapse):
        """Called every time a validator query arrives."""
        result = self.handler.handle(synapse)
        synapse.prediction = result["prediction"]
        synapse.confidence = result["confidence"]
        return synapse

    async def blacklist(self, synapse):
        """Filter: reject queries from non-validators."""
        caller_hotkey = synapse.dendrite.hotkey
        # ensure caller is in metagraph & has minimum stake
        if caller_hotkey not in self.metagraph.hotkeys:
            return True, "not in metagraph"
        uid = self.metagraph.hotkeys.index(caller_hotkey)
        if self.metagraph.S[uid] < 1000:  # min 1000 TAO stake = legit validator
            return True, "stake too low"
        return False, "ok"
```

:::tip Blacklist Matters
Without a blacklist, spam requests can flood your miner. **A minimum stake threshold** is the standard filter.
:::

---

## ⏱ Step 5: Timeout & Error Handling

### Rules of Thumb

| Budget | Recommended |
|---|---|
| Total response time | `< 2.5s` |
| Data API call | `< 1.5s` timeout |
| Prediction compute | `< 0.5s` |
| Fallback latency | `< 50ms` |

### Use async + Semaphore

If you load-test and see 10+ queries per second:

```python
import asyncio

SEM = asyncio.Semaphore(32)  # max 32 concurrent

async def forward(self, synapse):
    async with SEM:
        result = await asyncio.wait_for(
            asyncio.to_thread(self.handler.handle, synapse),
            timeout=2.0
        )
        synapse.prediction = result["prediction"]
        synapse.confidence = result["confidence"]
        return synapse
```

### Rate-Limit the Sports API

The Odds API free tier = 500 req/month. Use aggressive caching + only hit when truly necessary.

```python
# in OddsAPIClient, count quota
self._quota_used = 0

def get_event_odds(self, ...):
    if self._quota_used > 450:
        log.warning("API quota near limit, returning None")
        return None
    # ...
    self._quota_used += 1
```

---

## Step 6: Structured Logging & Observability

### JSON Logging

```python
# src/logging_setup.py
import logging
import json
import sys

class JSONFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        return json.dumps(payload)


def setup():
    h = logging.StreamHandler(sys.stdout)
    h.setFormatter(JSONFormatter())
    root = logging.getLogger()
    root.handlers = [h]
    root.setLevel(logging.INFO)
```

JSON logs make parsing in ELK / Loki / CloudWatch easy.

### Metrics to Log Per Request

```python
log.info("prediction_complete", extra={
    "event_id": event_id,
    "sport": sport,
    "latency_ms": elapsed_ms,
    "confidence": confidence,
    "cache_hit": bool(cached),
    "fallback": False,
})
```

### Daily Performance Summary

```bash
grep prediction_complete logs/miner.log \
  | jq -r '[.latency_ms, .fallback] | @csv' \
  | awk -F, '{sum+=$1; if($2=="true") fb++} END {print "avg_ms="sum/NR, "fallback_rate="fb/NR}'
```

---

## Checkpoint Validation

Test your handler **without waiting for a validator**:

```python
# tests/test_handler.py
from src.handler import PredictionHandler

class FakeReq:
    event_id = "test_event_1"
    sport = "mlb"
    home_team = "New York Yankees"
    away_team = "Boston Red Sox"
    kickoff_utc = "2026-04-14T23:05:00Z"

def test_happy_path():
    h = PredictionHandler()
    out = h.handle(FakeReq())
    assert "prediction" in out
    assert 0.0 <= out["confidence"] <= 1.0
    assert abs(sum(out["prediction"].values()) - 1.0) < 0.05
```

Run:

```bash
pytest tests/test_handler.py -v
```

:::tip Screenshot for Graduation
Save:
1. JSON log of 1 successful prediction (event_id, latency_ms, confidence)
2. Green `pytest` output
3. 5–10 lines of log showing validator query → response sent
:::

---

## Summary

- ✅ Understand the Sportstensor Synapse protocol structure
- ✅ Scaffolded handler + data wrapper + cache
- ✅ Baseline predictor uses implied probability from the odds API
- ✅ Graceful fallback + non-validator blacklist
- ✅ Total response budget `< 2.5s` + async/semaphore
- ✅ Structured JSON logging ready to parse

### ✅ Quick Check

1. What's the role of the `blacklist()` function in the miner?
2. Why use a TTL cache in front of the external API?
3. What's the fallback strategy when the data API times out?
4. Why is `confidence: 0.0` better than high confidence when uncertain?
5. What's the safe total response budget?

### Troubleshooting

| Symptom | Fix |
|---|---|
| `ODDS_API_KEY not set` | `source .env` before running, or restart PM2 |
| Latency spike > 3s | Profile: usually an API call. Add timeout + cache |
| Confidence always 0 | Baseline returns None → fallback. Check the Odds API response |
| 429 Too Many Requests | Use cache; upgrade API tier; throttle with semaphore |
| Validator disconnects mid-query | Network glitch: retry handled by validator, don't panic |
| Response malformed | Check the official Synapse protocol: fields may be named differently |

:::warning Don't Over-Engineer Yet
Baseline implied-odds + cache + fallback is **enough** to start. Next, we'll level up with an ML model. **Run first, optimize later.**
:::

---

**Next:** [SN41: Trading Strategies →](./sn41-trading-strategies)
