---
title: 'Miner Architecture'
sidebar_position: 5
description: 'Run the miner process 24/7 with PM2/systemd, register sports coverage metadata to the subnet, and monitor validator query logs to confirm the miner is alive.'
---

# Miner Architecture

:::info What You'll Learn
On this page you will:
- Configure a `.env` file with all secrets (API keys, wallet paths)
- **Register metadata** (sports & leagues you cover) on the subnet
- **Launch the miner process** for the first time and see validator query logs
- Set up **PM2** or **systemd** so the miner runs 24/7 and auto-restarts
- Know how to **monitor health** & log rotation
:::

:::note Prerequisites
- ✅ [Almanac Registration](/TH5-Running-a-Miner/obtaining-uid-and-binding) complete: binding succeeded
- ✅ Sportstensor repo cloned at `~/bittensor/sportstensor`
- ✅ `config.yaml` valid
- ✅ Port 8091 (or per config) reachable from the internet
- ✅ (Optional but recommended) API key from a sports data provider: The Odds API has a free tier, Sportradar trial is paid
:::

---

## Step 1: Set Up the `.env` File

Secrets and runtime config should **not** live in `config.yaml`. Use `.env` so it's not committed.

```bash
cd ~/bittensor/sportstensor
cp .env.example .env   # if it exists; otherwise create manually
nano .env
```

Example contents:

```bash
# === Wallet (optional, override config.yaml) ===
BT_WALLET_NAME=sn41_miner
BT_WALLET_HOTKEY=miner_01
BT_WALLET_PATH=/home/ubuntu/.bittensor/wallets

# === Subnet ===
BT_NETUID=41
BT_NETWORK=finney             # finney = mainnet; 'test' = testnet

# === Endpoint (miner listens here) ===
MINER_HOST=0.0.0.0
MINER_PORT=8091
MINER_EXTERNAL_IP=203.0.113.42
MINER_EXTERNAL_PORT=8091

# === Sports Data APIs ===
ODDS_API_KEY=your_odds_api_key_here
SPORTRADAR_API_KEY=your_sportradar_key_here   # optional

# === Logging ===
LOG_LEVEL=debug
LOG_DIR=./logs
```

:::danger .env = Secret
Make sure `.env` is in `.gitignore`. A leaked API key = your billing is blown.

```bash
echo ".env" >> .gitignore
```
:::

### Checkpoint

```bash
set -a; source .env; set +a
echo "Netuid: $BT_NETUID: Hotkey: $BT_WALLET_HOTKEY"
```

---

## Step 2: Register Metadata (Sports Coverage)

The subnet needs to know which sports you predict so validators only route relevant queries.

### Run Metadata Registration

The exact command varies by repo: typically:

```bash
python scripts/register_metadata.py \
  --wallet.name sn41_miner \
  --wallet.hotkey miner_01 \
  --sports "mlb,nba,nfl,soccer" \
  --netuid 41
```

Or via the package CLI:

```bash
sportstensor-miner metadata \
  --sports mlb,nba,nfl,soccer
```

### What Happens

1. Script builds the payload: `{hotkey, sports: [...], model_version: "x.y.z"}`
2. Signs with the hotkey
3. Submits to the metadata endpoint (could be on-chain commitment or almanac)
4. Receives confirmation

### Successful Output

```text
[metadata] Registering sports: ['mlb', 'nba', 'nfl', 'soccer']
[metadata] Model version: sportstensor-miner 2.1.0
[metadata] ✅ Metadata commit successful
  tx_hash / commit_ref: 0x9f3e...abcd
```

:::tip Start Narrow, Expand Later
If you're just starting, **pick one sport** (e.g., `mlb`). Focus optimization on one domain > be a jack-of-all-bad-predictions. Add sports after CLV is positive.
:::

---

## Step 3: Launch the Miner Process (Foreground First)

**Run in foreground first to verify everything works**:

```bash
cd ~/bittensor/sportstensor
source ~/bittensor/venv/bin/activate

python neurons/miner.py \
  --netuid 41 \
  --wallet.name sn41_miner \
  --wallet.hotkey miner_01 \
  --axon.port 8091 \
  --axon.external_ip 203.0.113.42 \
  --logging.debug
```

### Healthy Logs (Initial Example)

```text
2026-04-14 10:30:12 | INFO     | Loading wallet sn41_miner/miner_01
2026-04-14 10:30:13 | INFO     | Connected to subtensor finney (netuid 41)
2026-04-14 10:30:14 | INFO     | Metagraph synced. UID=142. N_miners=256
2026-04-14 10:30:14 | INFO     | Axon listening on 0.0.0.0:8091 (external: 203.0.113.42:8091)
2026-04-14 10:30:15 | INFO     | Miner ready. Waiting for validator queries...
```

### First Query Arrives (Could Be Minutes to Hours)

```text
2026-04-14 10:47:02 | DEBUG    | [validator 5Gh...abc UID=7] Query received
  event_id=mlb_2026_04_14_NYY_BOS sport=mlb kickoff=2026-04-14T19:05:00Z
2026-04-14 10:47:03 | DEBUG    | Prediction generated: home_win=0.58 confidence=0.72
2026-04-14 10:47:03 | INFO     | Response sent to validator 5Gh...abc in 247ms
```

:::tip No Query Within 1 Hour?
Normal at first: validators sometimes query in batches. Wait **up to 4 hours**. If still quiet:
- Verify almanac binding is active
- Check `metagraph`: make sure your UID is still listed
- Check the port is reachable from the internet
:::

### Stop (Ctrl+C) After You're Sure the Logs Are Healthy.

---

## Step 4: Run 24/7 With PM2

PM2 = a Node.js process manager that also works for Python. Auto-restart on crash, log rotation built-in.

### Install PM2

```bash
# requires Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### Start the Miner via PM2

```bash
cd ~/bittensor/sportstensor
pm2 start neurons/miner.py \
  --name sn41-miner \
  --interpreter ~/bittensor/venv/bin/python \
  -- \
  --netuid 41 \
  --wallet.name sn41_miner \
  --wallet.hotkey miner_01 \
  --axon.port 8091 \
  --axon.external_ip 203.0.113.42 \
  --logging.debug
```

:::tip Note the `--` Double Dash
Flags before `--` are for PM2. Flags after `--` are forwarded to the Python script.
:::

### PM2 Controls

```bash
pm2 status              # list all processes
pm2 logs sn41-miner     # tail logs in real time
pm2 logs sn41-miner --lines 100  # last 100 lines
pm2 restart sn41-miner  # restart
pm2 stop sn41-miner     # stop (don't delete)
pm2 delete sn41-miner   # remove from PM2
```

### Persist Across Reboots

```bash
pm2 save
pm2 startup
# follow the output instructions (copy-paste the `sudo env PATH=... pm2 ...` command)
```

After this, the miner auto-starts on every server reboot.

### Checkpoint

```bash
pm2 status
```

Expected:

```text
┌─────┬──────────────┬─────────┬─────────┬──────────┬────────┬──────┐
│ id  │ name         │ mode    │ status  │ cpu      │ memory │ ↺    │
├─────┼──────────────┼─────────┼─────────┼──────────┼────────┼──────┤
│ 0   │ sn41-miner   │ fork    │ online  │ 1.2%     │ 215mb  │ 0    │
└─────┴──────────────┴─────────┴─────────┴──────────┴────────┴──────┘
```

`status: online` + restart count `0` = healthy.

---

## Step 4b (Alternative): systemd

If you prefer native systemd:

```bash
sudo nano /etc/systemd/system/sn41-miner.service
```

Contents:

```ini
[Unit]
Description=Sportstensor SN41 Miner
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/bittensor/sportstensor
Environment="PATH=/home/ubuntu/bittensor/venv/bin:/usr/bin:/bin"
EnvironmentFile=/home/ubuntu/bittensor/sportstensor/.env
ExecStart=/home/ubuntu/bittensor/venv/bin/python neurons/miner.py \
  --netuid 41 \
  --wallet.name sn41_miner \
  --wallet.hotkey miner_01 \
  --axon.port 8091 \
  --axon.external_ip 203.0.113.42 \
  --logging.debug
Restart=always
RestartSec=10
StandardOutput=append:/var/log/sn41-miner.log
StandardError=append:/var/log/sn41-miner.err.log

[Install]
WantedBy=multi-user.target
```

Activate:

```bash
sudo systemctl daemon-reload
sudo systemctl enable sn41-miner
sudo systemctl start sn41-miner
sudo systemctl status sn41-miner
sudo journalctl -u sn41-miner -f   # tail logs
```

---

## Step 5: Monitoring & Health Checks

### A. Tail Logs in Real Time

```bash
pm2 logs sn41-miner --lines 50
# or
tail -f ~/bittensor/sportstensor/logs/miner.log
```

### B. Simple Watcher Script

Create `scripts/watch.sh`:

```bash
#!/bin/bash
while true; do
  echo "=== $(date) ==="
  echo "Process:"
  pm2 jlist | python3 -c "import sys,json; d=json.load(sys.stdin); m=[x for x in d if x['name']=='sn41-miner']; print('status:', m[0]['pm2_env']['status'] if m else 'NOT FOUND')"
  echo "Metagraph (emission & trust):"
  btcli subnet metagraph --netuid 41 2>/dev/null | grep "<hotkey_prefix>"
  echo
  sleep 300
done
```

### C. Query Counter

Grep logs to count queries per hour:

```bash
grep "Query received" logs/miner.log | wc -l
```

### D. Dashboard (Optional Advanced)

- **Grafana + Prometheus**: if the miner exposes a `/metrics` endpoint
- **Sportstensor public leaderboard**: check your miner's rank (URL per the official docs)

---

## Comprehensive Checkpoint Validation

After 2–6 hours of running, verify:

| Check | Command | Expected |
|---|---|---|
| Process alive | `pm2 status` | `online` + restart `0` |
| Queries arriving | `grep "Query received" logs/miner.log \| tail` | At least 1 entry |
| Successful responses | `grep "Response sent" logs/miner.log \| wc -l` | > 0 |
| No error cascades | `grep -i "error\|exception" logs/miner.log` | Rare / none |
| Trust/Rank starts non-zero (after 24–48 hours) | `btcli subnet metagraph --netuid 41` | Trust > 0 |

:::tip Screenshot for Graduation
Save:
1. The `pm2 status` output
2. 20–30 lines of log showing `Query received` + `Response sent`
3. `btcli subnet metagraph --netuid 41` with your UID visible
:::

---

## Log Rotation & Disk Hygiene

Debug logs can grow fast. PM2 built-in rotation:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 14
pm2 set pm2-logrotate:compress true
```

Or manually via `logrotate`:

```bash
sudo nano /etc/logrotate.d/sn41-miner
```

```text
/home/ubuntu/bittensor/sportstensor/logs/*.log {
    daily
    rotate 14
    compress
    missingok
    notifempty
    copytruncate
}
```

---

## Common Errors & Fixes

| Log error | Meaning | Fix |
|---|---|---|
| `Axon port already in use` | Port 8091 used by another process | `lsof -i :8091` → kill or change port |
| `Wallet not found` | Wrong wallet path | Check `BT_WALLET_PATH`; default `~/.bittensor/wallets` |
| `UID not in metagraph` | Not registered / deregistered | Go back to the registration step |
| `Connection refused to subtensor` | Chain endpoint down | Try fallback: `--subtensor.chain_endpoint wss://entrypoint-finney.opentensor.ai:443` |
| `Timeout waiting for query` | Normal if just started | Wait up to 4 hours; verify almanac |
| `OOM killed` | RAM low | Upgrade VPS or tune model batch size |
| Validator ping 404 on `/health` | Endpoint not implementing health check | Not a blocker; but implementing helps debugging |

---

## Summary

- ✅ Set up `.env` with secrets (API keys, paths)
- ✅ Registered sports-coverage metadata on the subnet
- ✅ Launched miner in foreground, verified healthy logs
- ✅ Migrated to PM2/systemd for 24/7 operation
- ✅ Monitor logs + set up log rotation
- ✅ Understand health check & common error remediation

### ✅ Quick Check

1. Why is `.env` separate from `config.yaml`?
2. What's the role of metadata registration beyond almanac binding?
3. PM2 vs systemd: when to choose which?
4. Why does log rotation matter for production miners?
5. After 6 hours of running, what number in the metagraph signals your miner is starting to be scored?

### Troubleshooting

| Symptom | Fix |
|---|---|
| PM2 doesn't restart after reboot | Re-run `pm2 save && pm2 startup` |
| Logs aren't rotating | Install the `pm2-logrotate` plugin |
| Disk suddenly full | Check `du -sh logs/`: usually debug logs are the culprit |
| Queries arrive but response times out | Your handler is too slow: tune trade execution |
| Validators send different query versions | Update the repo to the latest version (`git pull`) |

:::danger Monitor, Don't Set-and-Forget
Miners that are "set and forget" often underperform because validators update protocols and you fall behind. At minimum **check logs once a day** the first week.
:::

---

**Next:** [Programmatic Trade Execution →](/TH5-Running-a-Miner/sn41-trade-execution)
