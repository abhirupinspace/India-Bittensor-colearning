---
title: 'Run the Local Miner'
sidebar_position: 3
description: 'Clone the official Bittensor subnet-template, install dependencies, run the miner locally (Windows WSL2, macOS, Linux), keep it alive with screen/tmux, then make it reachable through firewall, port forwarding, or an Ngrok tunnel for CGNAT.'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Run the Local Miner

:::info What You'll Learn
By the end of this page you will:
- **Clone and install** `opentensor/bittensor-subnet-template`: the official generic miner template
- **Run the miner** locally for the first time and see logs of it connecting to the testnet
- **Use screen or tmux** to keep the miner running after the terminal is closed
- Verify the miner is **active in the metagraph** (the field `Active: True`)
- Make the miner **reachable from the internet** via firewall, port forwarding, or an Ngrok tunnel for CGNAT
:::

:::note Prerequisites
- ✅ [Registration](/TH4-Wallets-and-Miner-Setup/understanding-registration) complete: UID on NetUID 1 testnet
- ✅ venv active: `source ~/bittensor-env/bin/activate`
- ✅ Git installed: `git --version`
:::

---

## Step 1: Clone the Subnet Template

Bittensor provides a generic miner template that runs on testnet out of the box:

```bash
# Go to the home directory
cd ~

# Clone the official repo
git clone https://github.com/opentensor/bittensor-subnet-template.git

# Enter the folder
cd bittensor-subnet-template
```

Look at the repo structure:

```bash
ls -la
# You'll see: neurons/, template/, requirements.txt, README.md, etc.
```

---

## Step 2: Install Subnet Template Dependencies

Make sure the venv is still active, then:

Before installing, patch a single line in `setup.py` that causes errors on Python 3.12+: it's a dead import that's not used but creates a conflict:

```bash
# Remove the unused pkg_resources import from setup.py
sed -i '/from pkg_resources import parse_requirements/d' setup.py
```

Install the **CPU-only** version of PyTorch first (much smaller, ~200 MB vs the ~2 GB CUDA version):

```bash
pip install torch --index-url https://download.pytorch.org/whl/cpu
```

Then install the subnet template without re-downloading torch:

```bash
pip install -e . --no-deps
pip install starlette pydantic rich pytest numpy "setuptools>=68"
```

The `--no-deps` flag = install the package without re-installing all dependencies (since we installed torch manually above).

Verify:

```bash
python -c "import template; print('Template OK')"
# Output: Template OK
```

:::note Why Install torch Separately?
The subnet template's `requirements.txt` only specifies `torch>=2` without a qualifier: pip will download the latest CUDA version (~2 GB + NVIDIA libraries). For learning without a GPU, we install CPU-only PyTorch (~200 MB), which is sufficient for running a testnet miner.

If you've already downloaded the CUDA version (torch 2.x CUDA), it works too: the miner still runs, you've just used extra storage.
:::

---

## Step 3: Run the Miner (Foreground First)

First, run in the foreground to verify normal logs. Don't go straight to the background.

<Tabs>
<TabItem value="linux-wsl" label=" Linux / WSL2" default>

```bash
cd ~/bittensor-subnet-template

python neurons/miner.py \
  --netuid 1 \
  --wallet.name mywallet \
  --wallet.hotkey miner1 \
  --subtensor.network test \
  --logging.debug
```

</TabItem>
<TabItem value="macos" label=" macOS">

Use `caffeinate` to prevent the Mac from sleeping and killing the miner:

```bash
cd ~/bittensor-subnet-template

caffeinate -i python3 neurons/miner.py \
  --netuid 1 \
  --wallet.name mywallet \
  --wallet.hotkey miner1 \
  --subtensor.network test \
  --logging.debug
```

:::note Why caffeinate?
macOS aggressively kills processes when the screen turns off or it enters sleep mode. `caffeinate -i` keeps the Mac awake while the miner runs.
:::

</TabItem>
</Tabs>

### Healthy Logs

If the miner starts successfully, you'll see logs like:

```text
2026-04-21 10:30:12 | INFO     | Loading wallet mywallet/miner1
2026-04-21 10:30:13 | INFO     | Connected to subtensor test
2026-04-21 10:30:14 | INFO     | Syncing metagraph for netuid 1...
2026-04-21 10:30:15 | INFO     | Found UID 42 on netuid 1
2026-04-21 10:30:15 | INFO     | Axon serving on 0.0.0.0:8091
2026-04-21 10:30:16 | INFO     | Miner ready. Waiting for validator queries...
```

:::warning Normal Error Logs
You may see messages like `No validators found` or `Connection refused to validator X`: that's **normal** at first. Testnet validators aren't always active. What matters is no `ImportError` or exception during startup.
:::

**Press Ctrl+C** to stop after verifying the startup logs are clean.

---

## Step 4: Run the Miner in the Background

To keep the miner running after you close the terminal, use `screen` or `tmux`.

<Tabs>
<TabItem value="screen" label=" Screen (Easy)" default>

### Install screen

```bash
# Ubuntu/WSL2/Debian
sudo apt install -y screen

# macOS (via Homebrew)
brew install screen
```

### Create a new session

```bash
screen -S bittensor-miner
```

A new terminal opens. Inside the screen, run the miner:

<Tabs>
<TabItem value="screen-linux" label="Linux/WSL2">

```bash
source ~/bittensor-env/bin/activate
cd ~/bittensor-subnet-template

python neurons/miner.py \
  --netuid 1 \
  --wallet.name mywallet \
  --wallet.hotkey miner1 \
  --subtensor.network test \
  --logging.debug
```

</TabItem>
<TabItem value="screen-macos" label="macOS">

```bash
source ~/bittensor-env/bin/activate
cd ~/bittensor-subnet-template

caffeinate -i python3 neurons/miner.py \
  --netuid 1 \
  --wallet.name mywallet \
  --wallet.hotkey miner1 \
  --subtensor.network test \
  --logging.debug
```

</TabItem>
</Tabs>

### Detach from screen (the miner stays running)

Press **Ctrl+A**, then press **D** (detach).

You're back at the normal terminal, but the miner is still running in the background.

### Re-attach to the miner session

```bash
screen -r bittensor-miner
```

### Important screen commands

```bash
screen -ls                    # list all active sessions
screen -r bittensor-miner     # re-attach to the session
screen -X -S bittensor-miner quit  # kill the session (stop the miner)
```

</TabItem>
<TabItem value="tmux" label=" Tmux (Advanced)">

### Install tmux

```bash
# Ubuntu/WSL2
sudo apt install -y tmux

# macOS
brew install tmux
```

### Create a new session

```bash
tmux new -s bittensor-miner
```

Run the miner inside tmux:

```bash
source ~/bittensor-env/bin/activate
cd ~/bittensor-subnet-template

# Linux/WSL2
python neurons/miner.py --netuid 1 --wallet.name mywallet --wallet.hotkey miner1 --subtensor.network test --logging.debug

# macOS
caffeinate -i python3 neurons/miner.py --netuid 1 --wallet.name mywallet --wallet.hotkey miner1 --subtensor.network test --logging.debug
```

### Detach (the miner stays running)

Press **Ctrl+B**, then press **D**.

### Re-attach

```bash
tmux attach -t bittensor-miner
```

### Important tmux commands

```bash
tmux ls                           # list sessions
tmux attach -t bittensor-miner    # re-attach
tmux kill-session -t bittensor-miner  # kill/stop
```

</TabItem>
</Tabs>

---

## ✅ Step 5: Verify the Miner Is Active

After the miner has been running for a few minutes, open a new terminal and verify:

```bash
# Activate venv in the new terminal
source ~/bittensor-env/bin/activate

# Check the metagraph
btcli subnets metagraph --netuid 1 --network test
```

Find your UID in the table. The `Active` field should be `True`:

```text
│ UID │ Hotkey          │ Active │ Stake  │ Trust  │
│ 42  │ 5Gx1...miner1   │ True   │ τ 0.00 │ 0.0000 │
```

:::note Active vs Inactive
**Active: True** = the subnet detects your miner (axon endpoint responds).
**Active: False** = the port is not reachable (firewall, CGNAT). See the connection section below.
:::

---

## Miner Directory Structure

After setup, your local directory:

```
~/
├── bittensor-env/              # Python venv
│   └── bin/
│       ├── activate
│       ├── btcli
│       └── python
├── bittensor-subnet-template/  # Miner repo
│   ├── neurons/
│   │   └── miner.py           # Entry point
│   ├── template/              # Subnet logic
│   └── requirements.txt
└── .bittensor/
    └── wallets/
        └── mywallet/
            ├── coldkey
            ├── coldkeypub.txt
            └── hotkeys/
                └── miner1
```

---

## Running-Miner Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `No module named 'pkg_resources'` during `pip install -e .` | Dead import in `setup.py` line 27 incompatible with setuptools 82+ | `sed -i '/from pkg_resources import parse_requirements/d' setup.py` then `pip install -e .` |
| `ModuleNotFoundError: No module named 'template'` | `pip install -e .` not run yet | `cd ~/bittensor-subnet-template && pip install -e . --no-build-isolation` |
| `Wallet not found` | Wrong wallet/hotkey name | Check: `btcli wallet list` |
| `Connection refused` on startup | Testnet subtensor temporarily offline | Wait 5–10 minutes, try again |
| `Port 8091 already in use` | Another process is using port 8091 | `lsof -i :8091` → kill that PID; or change port: `--axon.port 8092` |
| Miner exits immediately without an error | Possibly a warning escalating to fatal | Run without `--logging.debug`, look at the initial output |
| `UID not found in metagraph` | Registration not yet confirmed on chain | Wait 2–3 minutes, the chain needs a few blocks |
| macOS: miner dies when screen sleeps | caffeinate not used | Add `caffeinate -i` before `python3` |
| WSL2: connection to subtensor fails | WSL2 network bridging issue | Try: `wsl --shutdown` in PowerShell, restart WSL2 |

---

## Connection, Ports & Ngrok (CGNAT)

Your miner is alive, but that's only half the job: validators must be able to **reach it from the internet**. This section covers the axon port, firewall/port forwarding, the CGNAT problem, and the Ngrok tunnel workaround.

### Why Does the Port Need to Be Open?

When the miner runs, it opens an **axon endpoint**: an HTTP server on port 8091 (default). Validators need to **reach this endpoint from the internet** in order to:
1. Send queries to your miner
2. Verify whether the miner is still active (health check)
3. Score the miner's responses and set weights

If port 8091 is not reachable from the internet → validators can't reach you → `Active: False` in the metagraph → **score 0, no reward**.

### Step 1: Check Your Internet Connection Type

```bash
# Check the public IP visible from the internet
curl -s ifconfig.me
```

```bash
# Check your local IP
ip addr show    # Linux/WSL2
ifconfig        # macOS
```

**Compare the two outputs:**

| Condition | Meaning |
|-----------|---------|
| `curl ifconfig.me` = a public IP, `ip addr` = `192.168.x.x` | Normal home NAT: port forwarding on the router works |
| `curl ifconfig.me` = a public IP, but `ip addr` = `10.x.x.x` or `100.64.x.x–100.127.x.x` | **CGNAT**: port forwarding won't work! |
| `curl ifconfig.me` fails / times out | Connection problem |

:::warning Residential ISPs & CGNAT
Many residential ISPs share one public IP across customers (**CGNAT**), so router port forwarding won't work. Business / dedicated lines usually give you a static public IP that you can port-forward. If your ISP uses CGNAT → **go directly to the Ngrok step**.
:::

### Step 2: Open Port 8091 on the Firewall

If you're **not on CGNAT** (you have a static public IP or can port-forward on the router), set up the firewall first.

<Tabs>
<TabItem value="linux-wsl-conn" label=" Linux / WSL2" default>

```bash
# Open port 8091 with UFW
sudo ufw allow 8091/tcp
sudo ufw status
```

:::note WSL2 and the Windows Firewall
WSL2 must also be configured in the **Windows Firewall**. Open PowerShell as Admin:

```powershell
New-NetFirewallRule -DisplayName "Bittensor Miner 8091" -Direction Inbound -LocalPort 8091 -Protocol TCP -Action Allow
```

And port-forward from Windows to WSL2:
```powershell
# Replace <WSL2_IP> with your WSL2 IP (check with: wsl hostname -I)
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=8091 connectaddress=<WSL2_IP> connectport=8091
```
:::

</TabItem>
<TabItem value="macos-conn" label=" macOS">

macOS uses an Application Firewall (not port-based). Python typically asks for permission the first time it opens a port. If a "Do you want the application 'Python' to accept incoming network connections?" dialog appears → click **Allow**.

Verify the port is open:

```bash
lsof -i :8091
# Output should show python3 listening on port 8091
```

</TabItem>
<TabItem value="linux-conn" label=" Linux (Non-WSL)">

```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 8091/tcp
sudo ufw enable

# firewalld (Fedora/RHEL)
sudo firewall-cmd --permanent --add-port=8091/tcp
sudo firewall-cmd --reload
```

</TabItem>
</Tabs>

#### Test the Connection from Outside

After the miner is running and the port is open, open **portchecker.co** or **canyouseeme.org**, enter your public IP + port 8091, and click "Check". If the result is "Open" → validators can reach you without a tunnel.

### Step 3: Ngrok TCP Tunnel (CGNAT Solution)

Ngrok creates a tunnel from the internet to your localhost: validators don't need to know your real IP, only the ngrok tunnel address.

#### Install Ngrok

<Tabs>
<TabItem value="linux-wsl-ngrok" label=" Linux / WSL2" default>

```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc \
  | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null

echo "deb https://ngrok-agent.s3.amazonaws.com buster main" \
  | sudo tee /etc/apt/sources.list.d/ngrok.list

sudo apt update && sudo apt install ngrok
```

</TabItem>
<TabItem value="macos-ngrok" label=" macOS">

```bash
brew install ngrok/ngrok/ngrok
```

</TabItem>
</Tabs>

#### Set the Auth Token & Open a Tunnel

1. Open **ngrok.com** → Sign Up (free), then **Dashboard → Your Authtoken**

```bash
ngrok config add-authtoken <YOUR_TOKEN>
ngrok tcp 8091
```

Ngrok output:

```text
Forwarding tcp://0.tcp.ap.ngrok.io:XXXXX -> localhost:8091
```

Note the forwarding address, e.g.: `0.tcp.ap.ngrok.io:12345`

#### Run the Miner With the Ngrok External IP

```bash
python neurons/miner.py \
  --netuid 1 \
  --wallet.name mywallet \
  --wallet.hotkey miner1 \
  --subtensor.network test \
  --axon.port 8091 \
  --axon.external_ip 0.tcp.ap.ngrok.io \
  --axon.external_port 12345 \
  --logging.debug
```

Replace `0.tcp.ap.ngrok.io` and `12345` with the values from your ngrok output.

:::warning Ngrok Free Plan: Limitations
- Free plan: **1 TCP tunnel at a time**, the ngrok address changes every restart
- Each ngrok restart → new address → must update the `--axon.external_ip` and `--axon.external_port` flags
- For stable production mining, upgrade to Ngrok Pro (static address) or use a VPS

For testnet learning, the free plan is enough to learn the flow.
:::

### Verification Commands

```bash
# Confirm the axon is listening locally
ss -tlnp | grep 8091       # Linux/WSL2
lsof -i :8091              # macOS/Linux

# Confirm the metagraph sees you as Active
btcli subnets metagraph --netuid 1 --network test
```

### Comparing Connection Solutions

| Solution | Best For | Setup | Stability | Cost |
|----------|----------|-------|-----------|------|
| **Router port forward** | Public IP without CGNAT | Easy | High | Free |
| **Ngrok Free** | CGNAT, learning/testnet | Easy | Medium (address changes) | Free |
| **Ngrok Pro** | CGNAT, semi-production | Easy | High | ~$10/month |
| **Cloudflare Tunnel** | CGNAT, production | Medium | Very high | Free (needs a domain) |
| **VPS in your region** | Serious production | Medium | Very high | ~$40/month |

---

## Summary

- **bittensor-subnet-template** = a generic miner template for testnet, no GPU required
- Run foreground first to verify clean startup logs
- **screen** or **tmux** = how to keep the miner running after closing the terminal
- **macOS**: must use `caffeinate -i` to prevent sleep
- Verification: `btcli subnets metagraph --netuid 1 --network test` → `Active: True`
- **Port 8091** must be reachable from the internet; **CGNAT** requires an Ngrok TCP tunnel with `--axon.external_ip` / `--axon.external_port`

### ✅ Quick Check

1. Why install the subnet template with `pip install -e .` instead of `pip install .`?
2. What happens to the miner if you close the terminal without screen/tmux?
3. Why does macOS require `caffeinate`?
4. What's the difference between `Active: True` vs `Active: False` in the metagraph?
5. How do you detect whether your ISP uses CGNAT, and what's the fix?

<details>
<summary> Answers</summary>

1. `-e` (editable mode) = the package is installed but the source remains in its original folder. If you edit a file in `template/`, the change takes effect without reinstalling. Good for development.
2. The miner dies when the terminal closes because the process is a child of that shell session. Screen/tmux detach the process from the terminal session.
3. macOS auto-enters sleep mode when the screen turns off → all non-essential processes are frozen or killed. `caffeinate -i` asks macOS to stay awake while the miner runs.
4. `Active: True` = the validator can reach the miner's axon endpoint. `Active: False` = the endpoint is not reachable (usually a firewall or CGNAT).
5. Compare `curl ifconfig.me` (public IP) with `ip addr` (local IP). If local is `10.x.x.x` or `100.64–127.x.x` = CGNAT → use an Ngrok TCP tunnel.

</details>

---

**Next:** [Logs, Common Errors & Debugging →](/TH5-Running-a-Miner/logs-errors-and-debugging)

*Your miner is alive and reachable. Now make sure validators can find it. *
