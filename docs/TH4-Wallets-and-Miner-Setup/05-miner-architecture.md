---
title: 'Miner Architecture'
sidebar_position: 5
description: 'Run the SN13 miner process 24/7 with PM2 or systemd, configure its scraping environment, and monitor logs and the metagraph to confirm the miner is alive and being scored.'
---

# Miner Architecture

:::info What You'll Learn
On this page you will:
- Configure a `.env` file with all secrets (API credentials, wallet paths)
- **Launch the miner process** for the first time and read its logs
- Set up **PM2** or **systemd** so the miner runs 24/7 and auto-restarts
- Know how to **monitor health**, rotate logs, and confirm you're being scored
:::

:::note Prerequisites
- ✅ [Understanding Registration](/TH4-Wallets-and-Miner-Setup/understanding-registration) complete: you hold a UID on netuid 13
- ✅ Data Universe repo cloned at `~/bittensor/data-universe`
- ✅ The **pinned miner venv** created (see [Getting Ready for Mining](/TH4-Wallets-and-Miner-Setup/getting-ready-for-mining))
- ✅ Scraper credentials ready (Reddit app credentials at minimum)
:::

:::danger Two venvs — do not mix them
`btcli` runs on **Bittensor 11**. The SN13 miner code pins **`bittensor==10.3.0`** and will not
run on 11. Keep them in separate virtual environments:

| venv | Package | Used for |
|---|---|---|
| `~/.venvs/bt` | `bittensor` (11.x) | `btcli` — wallets, registration, metagraph queries |
| `~/.venvs/sn13` | `bittensor==10.3.0` | running `neurons/miner.py` |

A consequence you'll see all over this page: **btcli** takes v11 flags (`-w`, `-H`, `-n`), while
the **miner script** takes legacy SDK argparse flags (`--wallet.name`, `--wallet.hotkey`).
That mismatch is expected — they're two different programs on two different SDK majors.
:::

---

## Step 1: Set Up the `.env` File

Secrets and runtime config should **not** live in the repo config. Use `.env` so it's not committed.

```bash
cd ~/bittensor/data-universe
cp .env.example .env   # if it exists; otherwise create manually
nano .env
```

Example contents:

```bash
# === Wallet (read by the MINER code, which runs SDK 10.3.0) ===
BT_WALLET_NAME=sn13_miner
BT_WALLET_HOTKEY=miner_01
BT_WALLET_PATH=/home/ubuntu/.bittensor/wallets

# === Subnet ===
BT_NETUID=13
BT_SUBTENSOR_NETWORK=finney   # finney = mainnet; 'test' = testnet

# === Scraper credentials ===
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password

# === Logging ===
LOG_LEVEL=debug
LOG_DIR=./logs
```

:::danger .env = Secret
Make sure `.env` is in `.gitignore`. Leaked scraper credentials get your accounts banned.

```bash
echo ".env" >> .gitignore
```
:::

:::warning Env var names differ between the two SDK majors
The variables above are read by the **miner code** (SDK 10.3.0). `btcli` v11 renamed them, so it
will ignore these — set the v11 names if you want btcli defaults on this box too:

| Purpose | Miner code (SDK 10.3.0) | btcli (Bittensor 11) |
|---|---|---|
| Wallet name | `BT_WALLET_NAME` | `BT_WALLET` |
| Hotkey name | `BT_WALLET_HOTKEY` | `BT_WALLET_HOTKEY` |
| Wallet path | `BT_WALLET_PATH` | `BT_WALLET_PATH` |
| Network | `BT_SUBTENSOR_NETWORK` | `BT_NETWORK` |

For btcli it's usually cleaner to skip env vars entirely and use `btcli config set` instead
(stored in `~/.bittensor/btcli.json`).
:::

### Checkpoint

```bash
set -a; source .env; set +a
echo "Netuid: $BT_NETUID — Hotkey: $BT_WALLET_HOTKEY"
```

### Unattended Coldkey Unlock

A 24/7 miner shouldn't need the coldkey at all — the **hotkey** signs weights and serving, and
hotkey files are plaintext (no password). If some automation genuinely needs a coldkey-signed
operation, btcli resolves the password in this order, first match wins:

1. An explicit `password=` argument (Python)
2. `BT_WALLET_PASSWORD`
3. A per-wallet variable named after the keyfile path (`BT_PW__...`)
4. A password file: `--wallet-password-file` or `BT_WALLET_PASSWORD_FILE`
5. macOS Keychain (`btcli wallet keychain`)
6. Interactive prompt

:::danger Don't put a coldkey password in `.env` on a mining server
The whole point of the cold/hot split is that the miner box never holds funds-moving authority.
If you find yourself wanting `BT_WALLET_PASSWORD` on a VPS, use a
[proxy](https://www.bittensor.com/docs/guides/proxies) with a narrow permission scope instead, or
sign from a separate workstation.
:::

---

## Step 2: Launch the Miner Process (Foreground First)

**Run in foreground first to verify everything works**:

```bash
cd ~/bittensor/data-universe
source ~/.venvs/sn13/bin/activate

python ./neurons/miner.py \
  --wallet.name sn13_miner \
  --wallet.hotkey miner_01 \
  --netuid 13 \
  --logging.debug
```

:::tip Try `--offline` first
Data Universe supports an offline mode that scrapes and fills your local index without touching
the chain. It's the cheapest way to prove your scrapers work before you care about scoring:

```bash
python ./neurons/miner.py --offline
```
:::

### Healthy Logs (Initial Example)

```text
2026-08-15 10:30:12 | INFO     | Loading wallet sn13_miner/miner_01
2026-08-15 10:30:13 | INFO     | Connected to subtensor finney (netuid 13)
2026-08-15 10:30:14 | INFO     | Metagraph synced. UID=142. N_miners=256
2026-08-15 10:30:15 | INFO     | Miner ready. Starting scrape loop...
2026-08-15 10:31:02 | INFO     | [reddit] scraped 240 rows for label r/bittensor_
2026-08-15 10:31:40 | INFO     | MinerIndex updated: 12,480 rows across 34 buckets
```

### What "Working" Looks Like

Unlike a request/response subnet, an SN13 miner is mostly a **scraping loop**. Progress shows up as:

1. Scrape batches landing in the local SQLite store
2. The **MinerIndex** growing (that's what validators read)
3. Periodic S3 uploads once you've configured storage

:::tip Nothing Scored Within a Few Hours?
Normal at first. Validators sample miners on their own schedule, and a brand-new index is small.
Before assuming a bug:
- Confirm your UID is still in the metagraph
- Confirm the scrape loop is actually adding rows (not erroring per-batch)
- Give it 24–48 hours before reading anything into your incentive
:::

### Stop (Ctrl+C) After You're Sure the Logs Are Healthy.

---

## Step 3: Run 24/7 With PM2

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
cd ~/bittensor/data-universe
pm2 start python \
  --name sn13-miner \
  --interpreter ~/.venvs/sn13/bin/python \
  -- \
  ./neurons/miner.py \
  --wallet.name sn13_miner \
  --wallet.hotkey miner_01 \
  --netuid 13 \
  --logging.debug
```

:::tip Note the `--` Double Dash
Flags before `--` are for PM2. Everything after `--` is forwarded to Python.
:::

### PM2 Controls

```bash
pm2 status              # list all processes
pm2 logs sn13-miner     # tail logs in real time
pm2 logs sn13-miner --lines 100  # last 100 lines
pm2 restart sn13-miner  # restart
pm2 stop sn13-miner     # stop (don't delete)
pm2 delete sn13-miner   # remove from PM2
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
│ 0   │ sn13-miner   │ fork    │ online  │ 1.2%     │ 215mb  │ 0    │
└─────┴──────────────┴─────────┴─────────┴──────────┴────────┴──────┘
```

`status: online` + restart count `0` = healthy.

---

## Step 3b (Alternative): systemd

If you prefer native systemd:

```bash
sudo nano /etc/systemd/system/sn13-miner.service
```

Contents:

```ini
[Unit]
Description=Data Universe SN13 Miner
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/bittensor/data-universe
Environment="PATH=/home/ubuntu/.venvs/sn13/bin:/usr/bin:/bin"
EnvironmentFile=/home/ubuntu/bittensor/data-universe/.env
ExecStart=/home/ubuntu/.venvs/sn13/bin/python ./neurons/miner.py \
  --wallet.name sn13_miner \
  --wallet.hotkey miner_01 \
  --netuid 13 \
  --logging.debug
Restart=always
RestartSec=10
StandardOutput=append:/var/log/sn13-miner.log
StandardError=append:/var/log/sn13-miner.err.log

[Install]
WantedBy=multi-user.target
```

Activate:

```bash
sudo systemctl daemon-reload
sudo systemctl enable sn13-miner
sudo systemctl start sn13-miner
sudo systemctl status sn13-miner
sudo journalctl -u sn13-miner -f   # tail logs
```

---

## Step 4: Monitoring & Health Checks

### A. Tail Logs in Real Time

```bash
pm2 logs sn13-miner --lines 50
# or
tail -f ~/bittensor/data-universe/logs/miner.log
```

### B. Simple Watcher Script

Create `scripts/watch.sh`:

```bash
#!/bin/bash
# btcli here is the v11 binary from ~/.venvs/bt — NOT the miner venv
BTCLI=~/.venvs/bt/bin/btcli

while true; do
  echo "=== $(date) ==="
  echo "Process:"
  pm2 jlist | python3 -c "import sys,json; d=json.load(sys.stdin); m=[x for x in d if x['name']=='sn13-miner']; print('status:', m[0]['pm2_env']['status'] if m else 'NOT FOUND')"
  echo "Metagraph (emission & trust):"
  $BTCLI subnets metagraph 13 2>/dev/null | grep "<hotkey_prefix>"
  echo
  sleep 300
done
```

### C. Scrape Counter

Grep logs to gauge throughput:

```bash
grep "scraped" logs/miner.log | wc -l
```

### D. Dashboard (Optional Advanced)

- **Grafana + Prometheus**: Data Universe ships `prometheus_client` and a FastAPI instrumentator
- **[Macrocosmos dashboards](https://www.macrocosmos.ai)** for network-level SN13 stats

---

## Comprehensive Checkpoint Validation

After 2–6 hours of running, verify:

| Check | Command | Expected |
|---|---|---|
| Process alive | `pm2 status` | `online` + restart `0` |
| Scraping working | `grep "scraped" logs/miner.log \| tail` | Recent entries |
| Index growing | `grep "MinerIndex updated" logs/miner.log \| tail -1` | Row count rising |
| No error cascades | `grep -i "error\|exception" logs/miner.log` | Rare / none |
| Trust/Rank non-zero (after 24–48 h) | `btcli subnets metagraph 13` | Trust > 0 |

:::tip Screenshot for Graduation
Save:
1. The `pm2 status` output
2. 20–30 lines of log showing scrape batches and an index update
3. `btcli subnets metagraph 13` with your UID visible
:::

---

## Log Rotation & Disk Hygiene

Debug logs can grow fast, and SN13 is storage-heavy to begin with. PM2 built-in rotation:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 14
pm2 set pm2-logrotate:compress true
```

Or manually via `logrotate`:

```bash
sudo nano /etc/logrotate.d/sn13-miner
```

```text
/home/ubuntu/bittensor/data-universe/logs/*.log {
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
| `ImportError` / `AttributeError` from `bittensor` | Miner venv is on SDK 11, not 10.3.0 | `pip install "bittensor==10.3.0"` in `~/.venvs/sn13` |
| `Wallet not found` | Wrong wallet path | Check `BT_WALLET_PATH`; default `~/.bittensor/wallets` |
| `UID not in metagraph` | Not registered / deregistered | Go back to the registration step |
| `Connection refused to subtensor` | Chain endpoint down | Retry; the SDK cycles a fallback endpoint pool automatically |
| Reddit `401` / `429` | Bad credentials or rate limited | Re-check `.env`; back off your scrape cadence |
| `database is locked` | Two miner processes on one SQLite store | Ensure only one `sn13-miner` in `pm2 status` |
| `OOM killed` | RAM low | Upgrade VPS or reduce scrape batch size |
| Disk full | Local store + logs grew | See log rotation above; check `du -sh` on the data dir |

---

## Summary

- ✅ Set up `.env` with scraper credentials and paths
- ✅ Launched the miner in foreground, verified healthy logs
- ✅ Migrated to PM2/systemd for 24/7 operation
- ✅ Monitor logs + set up log rotation
- ✅ Understand health checks & common error remediation
- ✅ Understand why btcli (v11) and the miner (SDK 10.3.0) live in separate venvs

### ✅ Quick Check

1. Why is `.env` separate from the repo's checked-in config?
2. Why do `btcli` and `neurons/miner.py` need different virtual environments?
3. PM2 vs systemd: when to choose which?
4. Why does log rotation matter more on SN13 than on a lightweight subnet?
5. After 24–48 hours, what number in the metagraph signals your miner is starting to be scored?

### Troubleshooting

| Symptom | Fix |
|---|---|
| PM2 doesn't restart after reboot | Re-run `pm2 save && pm2 startup` |
| Logs aren't rotating | Install the `pm2-logrotate` plugin |
| Disk suddenly full | Check `du -sh logs/` and the data dir |
| `btcli` command not found in a script | Use the absolute path `~/.venvs/bt/bin/btcli` |
| Miner runs but index never grows | Scraper credentials invalid — check for per-batch errors |

:::danger Monitor, Don't Set-and-Forget
Miners that are "set and forget" often underperform because subnet code and scoring change and you fall behind. At minimum **check logs once a day** the first week, and `git pull` the repo periodically.
:::

---

**Next:** [Getting Ready for Mining →](/TH4-Wallets-and-Miner-Setup/getting-ready-for-mining)
