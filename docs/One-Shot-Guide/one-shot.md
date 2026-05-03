---
title: 'One-Shot Guide: Zero to Miner'
description: 'Copy-paste end-to-end: fresh laptop → testnet miner → SN41 + SN13 mainnet miners running 24/7. Commands only, minimal prose.'
slug: /one-shot
---

# One-Shot Guide: Zero to Miner

Copy-paste path. No theory. Run top to bottom. Replace `<PLACEHOLDERS>` as you go.

:::warning Prereqs
- macOS / Ubuntu 22.04 / WSL2
- ~10 GB free disk, stable internet
- Read [Day 2 — Wallet Setup](../Day-2-Tooling-and-Ecosystem/wallet-setup) once before running step 4 — mnemonic loss = funds loss.
:::

---

## 0. Variables (set once, reuse below)

```bash
export WALLET_NAME=mywallet
export HOTKEY=miner1
export PUBLIC_IP=$(curl -s ifconfig.me)
echo "WALLET=$WALLET_NAME HOTKEY=$HOTKEY IP=$PUBLIC_IP"
```

---

## 1. Install Python 3.10 + venv + btcli

**macOS:**
```bash
brew install python@3.10
python3.10 -m venv ~/bittensor-env
source ~/bittensor-env/bin/activate
pip install --upgrade pip
pip install bittensor-cli "bittensor<10.0.0"
echo 'alias btenv="source ~/bittensor-env/bin/activate"' >> ~/.zprofile
```

**Ubuntu / WSL2:**
```bash
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.10 python3.10-venv python3.10-distutils build-essential git curl
python3.10 -m venv ~/bittensor-env
source ~/bittensor-env/bin/activate
pip install --upgrade pip
pip install bittensor-cli "bittensor<10.0.0"
echo 'alias btenv="source ~/bittensor-env/bin/activate"' >> ~/.bashrc
```

**Verify:**
```bash
btcli --version
python -c "import bittensor; print(bittensor.__version__)"
```

---

## 2. Create wallet (coldkey + hotkey)

```bash
source ~/bittensor-env/bin/activate
btcli wallet create --wallet-name $WALLET_NAME --hotkey $HOTKEY
```

**On screen:** write 24-word coldkey mnemonic on **paper** (2 copies). Same for hotkey.

```bash
btcli wallet list
btcli wallet overview --wallet-name $WALLET_NAME
```

Record the **coldkey SS58** and **hotkey SS58** addresses from output.

---

## 3. Get testnet TAO

Visit `https://app.minersunion.ai/testnet-faucet`, paste **coldkey SS58**, wait ~5 min.

```bash
btcli wallet balance --wallet-name $WALLET_NAME --network test
```

---

## 4. Register on testnet (netuid 1)

```bash
btcli config set --network test

btcli subnet register \
  --netuid 1 \
  --wallet-name $WALLET_NAME \
  --hotkey $HOTKEY \
  --network test
```

Note the **UID** from output.

```bash
btcli subnets metagraph --netuid 1 --network test | grep -A1 $HOTKEY
```

---

## 5. Run testnet miner (subnet template)

```bash
cd ~
git clone https://github.com/opentensor/bittensor-subnet-template.git
cd bittensor-subnet-template
sed -i.bak '/from pkg_resources import parse_requirements/d' setup.py

source ~/bittensor-env/bin/activate
pip install torch --index-url https://download.pytorch.org/whl/cpu
pip install -e . --no-deps
pip install starlette pydantic rich pytest numpy "setuptools>=68"
```

**Foreground smoke test:**
```bash
python neurons/miner.py \
  --netuid 1 \
  --wallet.name $WALLET_NAME \
  --wallet.hotkey $HOTKEY \
  --subtensor.network test \
  --logging.debug
```

Expect: `Axon serving on 0.0.0.0:8091` + `Miner ready`. `Ctrl+C` to stop.

**Background (screen):**
```bash
sudo apt install -y screen 2>/dev/null || true
screen -S bt-test -dm bash -c "
  source ~/bittensor-env/bin/activate &&
  cd ~/bittensor-subnet-template &&
  python neurons/miner.py --netuid 1 --wallet.name $WALLET_NAME --wallet.hotkey $HOTKEY --subtensor.network test --logging.debug
"
screen -ls
```

---

## 6. Open port 8091 (or ngrok for CGNAT)

**Public IP (no CGNAT):**
```bash
sudo ufw allow 8091/tcp
sudo ufw reload
```
Test at `https://portchecker.co` with `$PUBLIC_IP:8091`.

**CGNAT (residential ISP, IP starts `100.64-127.x` or `10.x`):**
```bash
# macOS
brew install ngrok/ngrok/ngrok
# Linux
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install -y ngrok

ngrok config add-authtoken <YOUR_NGROK_TOKEN>
ngrok tcp 8091
# Note: tcp://X.tcp.ap.ngrok.io:NNNNN — used as external_ip + external_port below
```

---

## 7. Fund mainnet wallet

Buy TAO on Kraken / MEXC / Gate.io / KuCoin. Withdraw **native TAO** to your **coldkey SS58**.

> Test with **0.01 TAO** first. Wait for confirmation. Then send the rest.

```bash
btcli config set --network finney
btcli wallet overview --wallet-name $WALLET_NAME
```

---

## 8. Register SN41 (Sportstensor) — mainnet

```bash
btcli subnet burn_cost --netuid 41

btcli subnet register \
  --netuid 41 \
  --wallet-name $WALLET_NAME \
  --wallet.hotkey $HOTKEY
```

Save **UID**.

```bash
btcli subnet metagraph --netuid 41 | grep $HOTKEY
```

---

## 9. Clone Sportstensor + configure

```bash
mkdir -p ~/bittensor && cd ~/bittensor
git clone https://github.com/sportstensor/sportstensor.git
cd sportstensor

source ~/bittensor-env/bin/activate
pip install -r requirements.txt
pip install -e .
```

**`config.yaml`:**
```bash
cp config.example.yaml config.yaml
cat > config.yaml <<EOF
wallet:
  name: $WALLET_NAME
  hotkey: $HOTKEY
  path: ~/.bittensor/wallets

subtensor:
  network: finney
  netuid: 41

miner:
  endpoint: "http://$PUBLIC_IP:8091"
  external_ip: "$PUBLIC_IP"
  external_port: 8091
  name: "sn41-miner-1"

sports:
  - mlb
  - nba
  - nfl
  - soccer

logging:
  level: debug
  file: ./logs/miner.log
EOF
```

If using ngrok, replace `external_ip` with `X.tcp.ap.ngrok.io` and `external_port` with the ngrok port.

**`.env`:** (get free key at `https://the-odds-api.com`)
```bash
cat > .env <<EOF
BT_WALLET_NAME=$WALLET_NAME
BT_WALLET_HOTKEY=$HOTKEY
BT_WALLET_PATH=~/.bittensor/wallets
BT_NETUID=41
BT_NETWORK=finney
MINER_HOST=0.0.0.0
MINER_PORT=8091
MINER_EXTERNAL_IP=$PUBLIC_IP
MINER_EXTERNAL_PORT=8091
ODDS_API_KEY=<paste_from_the-odds-api.com>
LOG_LEVEL=debug
LOG_DIR=./logs
EOF
echo ".env" >> .gitignore
```

---

## 10. Almanac registration (SN41)

```bash
cd ~/bittensor/sportstensor
source ~/bittensor-env/bin/activate
python scripts/register_almanac.py \
  --config config.yaml \
  --wallet.name $WALLET_NAME \
  --wallet.hotkey $HOTKEY
```

Expect `almanac_id` + endpoint URL in output.

---

## 11. SN41 miner under PM2 (24/7)

```bash
# Install Node + PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

cd ~/bittensor/sportstensor
pm2 start neurons/miner.py \
  --name sn41-miner \
  --interpreter ~/bittensor-env/bin/python \
  -- \
  --netuid 41 \
  --wallet.name $WALLET_NAME \
  --wallet.hotkey $HOTKEY \
  --axon.port 8091 \
  --axon.external_ip $PUBLIC_IP \
  --axon.external_port 8091 \
  --logging.debug

pm2 save
pm2 startup
# Run the sudo command pm2 prints

pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 14
pm2 set pm2-logrotate:compress true
```

**Verify:**
```bash
pm2 list
pm2 logs sn41-miner --lines 50
```

---

## 12. SN13 (Data Universe) — provision VPS

Pick a Singapore VPS (Vultr HF, Hetzner, DigitalOcean): **4 vCPU / 8 GB RAM / 500 GB NVMe**.

```bash
# From local machine
ssh root@<VPS_IP>
```

**On VPS:**
```bash
apt update && apt upgrade -y
adduser miner
usermod -aG sudo miner
ufw allow OpenSSH
ufw allow 8091/tcp
ufw --force enable
exit
```

```bash
# From local
ssh miner@<VPS_IP>
```

**On VPS as `miner`:**
```bash
sudo apt install -y build-essential git curl wget \
  python3.10 python3.10-venv python3-pip libssl-dev pkg-config

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts && nvm use --lts
npm install -g pm2

python3.10 -m venv ~/bittensor-env
source ~/bittensor-env/bin/activate
pip install --upgrade pip bittensor-cli "bittensor<10.0.0"
```

---

## 13. SN13 — wallet on VPS (hotkey only, NEVER coldkey)

```bash
# VPS
source ~/bittensor-env/bin/activate
btcli wallet new_hotkey --wallet.name $WALLET_NAME --wallet.hotkey sn13_miner
# Write down NEW hotkey mnemonic on paper
```

Move the **coldkeypub** (NOT coldkey) from local → VPS:
```bash
# Local
scp ~/.bittensor/wallets/$WALLET_NAME/coldkeypub.txt miner@<VPS_IP>:~/.bittensor/wallets/$WALLET_NAME/coldkeypub.txt
```

**Sign registration tx from local using coldkey** — easiest path: register from local, then deploy hotkey to VPS:
```bash
# Local (has coldkey)
btcli wallet new_hotkey --wallet.name $WALLET_NAME --wallet.hotkey sn13_miner
btcli subnet register --netuid 13 --wallet.name $WALLET_NAME --wallet.hotkey sn13_miner
# Save UID

# Copy hotkey to VPS
scp ~/.bittensor/wallets/$WALLET_NAME/hotkeys/sn13_miner miner@<VPS_IP>:~/.bittensor/wallets/$WALLET_NAME/hotkeys/sn13_miner
```

```bash
# VPS — verify
btcli wallet overview --wallet.name $WALLET_NAME
```

---

## 14. SN13 — clone repo + config

```bash
# VPS
cd ~
git clone https://github.com/macrocosm-os/data-universe.git
cd data-universe
python3.10 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

**`.env`:**
```bash
cat > .env <<'EOF'
BT_WALLET_NAME=mywallet
BT_WALLET_HOTKEY=sn13_miner
BT_WALLET_PATH=~/.bittensor/wallets
BT_NETUID=13
BT_NETWORK=finney

MINER_HOST=0.0.0.0
MINER_PORT=8091

REDDIT_CLIENT_ID=<reddit.com/prefs/apps - script type>
REDDIT_CLIENT_SECRET=<from_reddit>
REDDIT_USERNAME=<your_reddit>
REDDIT_PASSWORD=<your_reddit_pw>
REDDIT_USER_AGENT=sn13-miner/0.1

TWITTER_USERNAME=<dummy_account>
TWITTER_PASSWORD=<dummy_pw>

S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
S3_BUCKET=sn13-miner-<your_uid>
S3_ACCESS_KEY=<r2_access_key>
S3_SECRET_KEY=<r2_secret_key>
S3_REGION=auto

LOG_LEVEL=debug
LOG_DIR=./logs
EOF
echo ".env" >> .gitignore
```

**`config.json`:**
```bash
cat > config.json <<'EOF'
{
  "scraper_configs": [
    {
      "scraper": "reddit",
      "enabled": true,
      "cadence_seconds": 300,
      "labels_to_scrape": [{
        "label_choices": ["r/cryptocurrency","r/bittensor_","r/MachineLearning","r/wallstreetbets","r/technology"],
        "max_data_entities": 100,
        "max_age_hint_minutes": 60
      }]
    },
    {
      "scraper": "X.twikit",
      "enabled": true,
      "cadence_seconds": 240,
      "labels_to_scrape": [{
        "label_choices": ["#bittensor","#TAO","#AI","#crypto"],
        "max_data_entities": 150,
        "max_age_hint_minutes": 30
      }]
    }
  ],
  "miner": {
    "upload_cadence_seconds": 1800,
    "local_buffer_max_mb": 2048,
    "compression": "gzip",
    "dedup_window_hours": 24
  }
}
EOF
```

---

## 15. SN13 — Cloudflare R2 storage

1. `cloudflare.com` → R2 → **Create bucket** `sn13-miner-<uid>`
2. **Manage R2 API Tokens** → Create token → Object Read & Write → scope to bucket
3. Copy **Access Key ID**, **Secret Access Key**, **Endpoint** (`<account_id>.r2.cloudflarestorage.com`)
4. Paste into `.env` from step 14

---

## 16. SN13 miner — smoke test then PM2

```bash
# Smoke
cd ~/data-universe && source venv/bin/activate
python neurons/miner.py \
  --netuid 13 --subtensor.network finney \
  --wallet.name $WALLET_NAME --wallet.hotkey sn13_miner \
  --axon.port 8091 --logging.debug
# Watch ~30s, no exceptions, Ctrl+C
```

**`ecosystem.config.js`:**
```bash
cat > ecosystem.config.js <<'EOF'
module.exports = {
  apps: [{
    name: "sn13-miner",
    script: "venv/bin/python",
    args: "neurons/miner.py --netuid 13 --subtensor.network finney --wallet.name mywallet --wallet.hotkey sn13_miner --axon.port 8091 --logging.info",
    cwd: "/home/miner/data-universe",
    autorestart: true,
    max_memory_restart: "4G",
    restart_delay: 10000,
    env: { PYTHONUNBUFFERED: "1" },
    error_file: "/home/miner/logs/sn13-err.log",
    out_file: "/home/miner/logs/sn13-out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss"
  }]
};
EOF

mkdir -p ~/logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Run the sudo command it prints

pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

---

## 17. Daily ops cheatsheet

**Status:**
```bash
pm2 list
btcli wallet overview --wallet-name $WALLET_NAME
btcli subnet metagraph --netuid 41 | grep $HOTKEY
btcli subnet metagraph --netuid 13 | grep sn13_miner
```

**Logs:**
```bash
pm2 logs sn41-miner --lines 100
pm2 logs sn13-miner --lines 100
```

**Restart:**
```bash
pm2 restart sn41-miner
pm2 restart sn13-miner
```

**R2 size (install rclone first):**
```bash
rclone config   # add r2 remote with R2 keys
rclone size r2:sn13-miner-<uid>
```

---

## 18. Success signals (24–48 h after start)

**SN41:**
- ✅ `pm2 list` → `online`, restart=0
- ✅ `pm2 logs sn41-miner | grep "Response sent"` → multiple/hour
- ✅ Metagraph row shows non-zero **Incentive**

**SN13:**
- ✅ `pm2 list` → `online`, restart=0
- ✅ `rclone size r2:sn13-miner-<uid>` → Count > 0, Total > 100 MB
- ✅ Metagraph row shows non-zero **Incentive**

---

## 19. Submission checklist

Collect these for camp submission:

| Item | How to get |
|---|---|
| Name | Your full name (camp registration) |
| Hotkey Address | `btcli wallet overview --wallet-name $WALLET_NAME` → hotkey SS58 |
| Subnet ID / NetUID | `41` (Sportstensor) or `13` (Data Universe) |
| Miner UID | `btcli subnet metagraph --netuid 41 \| grep $HOTKEY` (and `--netuid 13 \| grep sn13_miner`) |
| Miner Screenshot | `pm2 list` terminal output |
| Logs Screenshot | `pm2 logs sn41-miner --lines 50` + same for sn13 |

---

:::tip Stuck?
- Day 4 → [Local Debugging](../Day-4-Mining-and-Optimization/local-debugging) for crash loops
- Day 3 → [Connection & Ports](../Day-3-Testnet-and-Registration/connection-and-ports) for ngrok / CGNAT
- [Resources](/resources) for whitepaper, Taostats, official repos
:::
