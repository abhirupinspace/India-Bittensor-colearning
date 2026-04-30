---
sidebar_position: 2
title: '🐍 Unit 2: Install Python, venv & btcli'
description: 'Install Python 3.10+, create an isolated virtual environment, install bittensor-cli and the Bittensor SDK, then verify everything runs on Windows WSL2, macOS, and Linux.'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🐍 Unit 2: Install Python, venv & btcli

:::info Goal of This Unit
By the end of this unit you will:
- Have **Python 3.10+** installed and verified
- Have an isolated **virtual environment** at `~/bittensor-env`
- Have **`btcli`** and the **Bittensor SDK** (`bittensor<10.0.0`) installed in the venv
- Be able to run `btcli --help` without errors
:::

:::note Prerequisites
- ✅ [Unit 1](./intro-and-hardware-check) complete: WSL2 active (Windows) or terminal ready
- ✅ Internet connection for downloading packages
:::

---

## 🐍 Step 1: Install Python 3.10+

<Tabs>
<TabItem value="windows" label="🪟 Windows (WSL2)" default>

Open the **Ubuntu** terminal (not PowerShell/CMD).

Ubuntu 22.04 includes Python 3.10 by default. Verify:

```bash
python3 --version
# Output: Python 3.10.12 (or newer)
```

If Python is missing or outdated:

```bash
# Add the deadsnakes PPA (for Ubuntu 20.04)
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.10 python3.10-venv python3.10-distutils

# Install pip for Python 3.10
curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10
```

Install build dependencies:

```bash
sudo apt install -y build-essential git curl wget libssl-dev pkg-config python3-pip
```

</TabItem>
<TabItem value="macos" label="🍎 macOS">

macOS ships with some version of Python 3.x but it can vary. Install a specific version via Homebrew:

```bash
brew install python@3.10
```

Add to PATH:

```bash
# Apple Silicon (M1/M2/M3)
echo 'export PATH="/opt/homebrew/opt/python@3.10/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile

# Intel Mac
echo 'export PATH="/usr/local/opt/python@3.10/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile
```

Verify:

```bash
python3.10 --version
# Output: Python 3.10.x
```

</TabItem>
<TabItem value="linux" label="🐧 Linux">

**Ubuntu 22.04** (Python 3.10 already included):
```bash
python3 --version
sudo apt install -y python3-pip python3-venv build-essential git curl
```

**Ubuntu 20.04** (needs an update):
```bash
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.10 python3.10-venv python3.10-distutils
```

**Fedora:**
```bash
sudo dnf install python3.10 python3-pip git curl
```

</TabItem>
</Tabs>

---

## 📦 Step 2: Create a Virtual Environment

A virtual environment (venv) = an isolated sandbox for Python dependencies. Important so btcli doesn't conflict with system packages.

<Tabs>
<TabItem value="windows" label="🪟 Windows (WSL2)" default>

```bash
# Create the venv in your home directory
python3 -m venv ~/bittensor-env

# Activate the venv
source ~/bittensor-env/bin/activate

# Your prompt will change to:
# (bittensor-env) ubuntu@hostname:~$
```

Add an alias so you don't have to type the full path each time:

```bash
echo 'alias btenv="source ~/bittensor-env/bin/activate"' >> ~/.bashrc
source ~/.bashrc
```

Now you can just type `btenv` to activate the venv.

</TabItem>
<TabItem value="macos" label="🍎 macOS">

```bash
# Create the venv
python3.10 -m venv ~/bittensor-env

# Activate the venv
source ~/bittensor-env/bin/activate

# Your prompt becomes:
# (bittensor-env) username@hostname ~ %
```

Add an alias:

```bash
echo 'alias btenv="source ~/bittensor-env/bin/activate"' >> ~/.zprofile
source ~/.zprofile
```

</TabItem>
<TabItem value="linux" label="🐧 Linux">

```bash
# Create the venv
python3 -m venv ~/bittensor-env

# Activate
source ~/bittensor-env/bin/activate

# Convenient alias
echo 'alias btenv="source ~/bittensor-env/bin/activate"' >> ~/.bashrc
source ~/.bashrc
```

</TabItem>
</Tabs>

:::warning Don't Forget to Activate the venv
Every time you open a new terminal you must activate the venv again: `source ~/bittensor-env/bin/activate` (or `btenv` if you set up the alias). If you forget, `btcli` won't be found.
:::

---

## 🔧 Step 3: Install btcli & the Bittensor SDK

Make sure the venv is **active** (you see `(bittensor-env)` in the prompt) before continuing.

```bash
# Upgrade pip first
pip install --upgrade pip

# Install the Bittensor CLI (command-line tool)
pip install bittensor-cli

# Install the Bittensor SDK: IMPORTANT: pin to a version < 10.0.0
# Many subnet templates aren't yet compatible with SDK v10+
pip install "bittensor<10.0.0"
```

:::danger Why `bittensor<10.0.0`?
Bittensor SDK v10.0.0 introduced breaking changes to internal APIs. Most public subnet templates (including `opentensor/bittensor-subnet-template`) still use the older SDK structure. If you install the latest version, you may get `ImportError` or `AttributeError` when running the miner.

If the specific subnet you use later supports SDK v10+, you can upgrade then.
:::

---

## ✅ Step 4: Verify the Installation

```bash
# Verify btcli
btcli --help
# Should show help text with the list of commands

# Verify btcli version
btcli --version
# Output: btcli/x.x.x ...

# Verify the SDK
python -c "import bittensor; print('bittensor version:', bittensor.__version__)"
# Output: bittensor version: 7.x.x or 8.x.x (must be < 10)
```

Normal `btcli --help` output:

```text
usage: btcli <command> <command args>

bittensor cli v8.x.x

positional arguments:
  {wallet,subnets,stake,root,info,...}
    wallet              Commands for managing and viewing wallets.
    subnets             Commands for interacting with subnets.
    ...
```

:::tip If You See `btcli: command not found`
The venv isn't active. Run:
```bash
source ~/bittensor-env/bin/activate
```
And try again.
:::

---

## 🔐 Step 4b: Fix SSL (If Needed)

Some setups encounter SSL errors when btcli connects to the chain. If you see `SSL: CERTIFICATE_VERIFY_FAILED`:

```bash
python -m bittensor certifi
```

---

## 🐛 Install Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `error: Microsoft Visual C++ 14.0 required` | You're on Windows without WSL2 | Switch to the WSL2 Ubuntu terminal |
| `failed building wheel for cryptography` | Missing dev headers | `sudo apt install libssl-dev libffi-dev python3-dev` |
| `pip: command not found` | pip isn't in the venv's PATH | `python3 -m ensurepip --upgrade` |
| `btcli: command not found` | venv not active | `source ~/bittensor-env/bin/activate` |
| `ModuleNotFoundError: 'bittensor'` | SDK not installed or wrong venv | Make sure venv is active, then `pip install "bittensor<10.0.0"` |
| `ERROR: Could not find a version that satisfies the requirement bittensor` | Network issue / PyPI timeout | `pip install "bittensor<10.0.0" --retries 5` |
| `ImportError: cannot import name 'X' from 'bittensor'` | SDK v10+ incompatible | `pip uninstall bittensor && pip install "bittensor<10.0.0"` |

---

## 📋 Quick Reference: Daily Commands

```bash
# Activate the venv (required every new session)
source ~/bittensor-env/bin/activate   # or: btenv

# Deactivate the venv
deactivate

# Check installed packages
pip list | grep -E "bittensor|btcli"

# Update btcli alone (without upgrading the SDK)
pip install --upgrade bittensor-cli
```

---

## 🎯 Summary

- **Python 3.10+** is the minimum requirement: Ubuntu 22.04 already includes it
- **venv** isolated at `~/bittensor-env`: activate it every new session
- Install **`bittensor-cli`** (btcli) and **`bittensor<10.0.0`** (SDK) separately
- The `btenv` alias makes activation easier

---

**Next:** [Unit 3: Wallet Setup (Coldkey & Hotkey) →](./wallet-setup)

*A clean environment = easy debugging. 🧪*
