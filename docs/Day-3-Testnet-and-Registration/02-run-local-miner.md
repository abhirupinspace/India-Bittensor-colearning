---
title: 'Unit 5: Run the Local Miner'
description: 'Clone the official Bittensor subnet-template, install dependencies, and run the miner on your local computer (Windows WSL2, macOS, Linux), keeping it alive in the background with screen/tmux.'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Unit 5: Run the Local Miner

:::info Goal of This Unit
By the end of this unit you will:
- **Clone and install** `opentensor/bittensor-subnet-template`: the official generic miner template
- **Run the miner** locally for the first time and see logs of it connecting to the testnet
- **Use screen or tmux** to keep the miner running after the terminal is closed
- Verify the miner is **active in the metagraph** (the field `Active: True`)
:::

:::note Prerequisites
- ✅ [Unit 4](./register-subnet-testnet) complete: UID on NetUID 1 testnet
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
**Active: False** = the port is not reachable (firewall, CGNAT). See Unit 6.
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

## Summary

- **bittensor-subnet-template** = a generic miner template for testnet, no GPU required
- Run foreground first to verify clean startup logs
- **screen** or **tmux** = how to keep the miner running after closing the terminal
- **macOS**: must use `caffeinate -i` to prevent sleep
- Verification: `btcli subnets metagraph --netuid 1 --network test` → `Active: True`

### ✅ Quick Check

1. Why install the subnet template with `pip install -e .` instead of `pip install .`?
2. What happens to the miner if you close the terminal without screen/tmux?
3. Why does macOS require `caffeinate`?
4. What's the difference between `Active: True` vs `Active: False` in the metagraph?

<details>
<summary> Answers</summary>

1. `-e` (editable mode) = the package is installed but the source remains in its original folder. If you edit a file in `template/`, the change takes effect without reinstalling. Good for development.
2. The miner dies when the terminal closes because the process is a child of that shell session. Screen/tmux detach the process from the terminal session.
3. macOS auto-enters sleep mode when the screen turns off → all non-essential processes are frozen or killed. `caffeinate -i` asks macOS to stay awake while the miner runs.
4. `Active: True` = the validator can reach the miner's axon endpoint. `Active: False` = the endpoint is not reachable (usually a firewall or CGNAT).

</details>

---

**Next:** [Unit 6: Connection, Ports & Ngrok for CGNAT →](./connection-and-ports)

*Your miner is alive! Now make sure validators can find it. *
