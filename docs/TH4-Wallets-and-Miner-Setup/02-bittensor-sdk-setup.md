---
title: 'Setting Up the Bittensor SDK'
sidebar_position: 2
description: 'Install Python 3.10–3.14, create isolated virtual environments, install Bittensor 11 (SDK + btcli in one package) plus a pinned venv for subnet miner code, then verify everything runs on Windows WSL2, macOS, and Linux.'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Setting Up the Bittensor SDK

:::info What You'll Learn
By the end of this page you will:
- Have **Python 3.10–3.14** installed and verified
- Have an isolated **virtual environment** at `~/.venvs/bt` running **Bittensor 11**
- Have a second, **pinned** venv at `~/.venvs/sn13` for subnet miner code, and understand why
- Be able to run `btcli --help` without errors
:::

:::note Prerequisites
- ✅ [Installing Dependencies](/TH4-Wallets-and-Miner-Setup/installing-dependencies) complete: WSL2 active (Windows) or terminal ready
- ✅ Internet connection for downloading packages
:::

---

## Step 1: Install Python 3.10+

<Tabs>
<TabItem value="windows" label=" Windows (WSL2)" default>

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
<TabItem value="macos" label=" macOS">

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
<TabItem value="linux" label=" Linux">

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

## Step 2: Create a Virtual Environment

A virtual environment (venv) = an isolated sandbox for Python dependencies. Important so btcli doesn't conflict with system packages.

<Tabs>
<TabItem value="windows" label=" Windows (WSL2)" default>

```bash
# Create the venv in your home directory
python3 -m venv ~/.venvs/bt

# Activate the venv
source ~/.venvs/bt/bin/activate

# Your prompt will change to:
# (bt) ubuntu@hostname:~$
```

Add an alias so you don't have to type the full path each time:

```bash
echo 'alias btenv="source ~/.venvs/bt/bin/activate"' >> ~/.bashrc
source ~/.bashrc
```

Now you can just type `btenv` to activate the venv.

</TabItem>
<TabItem value="macos" label=" macOS">

```bash
# Create the venv
python3 -m venv ~/.venvs/bt

# Activate the venv
source ~/.venvs/bt/bin/activate

# Your prompt becomes:
# (bt) username@hostname ~ %
```

Add an alias:

```bash
echo 'alias btenv="source ~/.venvs/bt/bin/activate"' >> ~/.zprofile
source ~/.zprofile
```

</TabItem>
<TabItem value="linux" label=" Linux">

```bash
# Create the venv
python3 -m venv ~/.venvs/bt

# Activate
source ~/.venvs/bt/bin/activate

# Convenient alias
echo 'alias btenv="source ~/.venvs/bt/bin/activate"' >> ~/.bashrc
source ~/.bashrc
```

</TabItem>
</Tabs>

:::warning Don't Forget to Activate the venv
Every time you open a new terminal you must activate the venv again: `source ~/.venvs/bt/bin/activate` (or `btenv` if you set up the alias). If you forget, `btcli` won't be found.
:::

---

## Step 3: Install Bittensor 11

Make sure the venv is **active** (you see `(bt)` in the prompt) before continuing.

Since **Bittensor 11** (July 2026) there is only **one package**. It ships the SDK, the wallet,
and the `btcli` command together:

```bash
# Upgrade pip first
pip install --upgrade pip

# One package = SDK + wallet + btcli
pip install bittensor
```

:::danger If you ever installed the old packages, remove them first
Before v11, `btcli` shipped as a separate `bittensor-cli` package and the wallet as
`bittensor-wallet`. Both were **archived upstream in July 2026**. If they're still installed
you'll end up with a conflicting `btcli` on your PATH:

```bash
pip uninstall -y bittensor-cli bittensor-wallet
pip install -U bittensor
```
:::

:::danger Supply-chain risk is not hypothetical here
In **July 2024** a compromised PyPI release of the legacy `bittensor` package (**6.12.2**)
exfiltrated coldkey material from every machine that installed it. The chain ran in safe mode
from **July 2–12, 2024** while the damage was contained.

Practical rules:
- **Pin exact versions** in anything unattended (a VPS miner, CI) — never a bare `pip install` in automation
- Upgrade only to releases announced on official channels
- For a machine holding real value, install from the source repo at a **signed tag** (`git tag -v`) rather than trusting a package index
- Install into a **venv**, never system-wide, so a bad package can't shadow everything
:::

:::note Where the SDK lives now
`opentensor/bittensor` was archived on 2026-07-10. SDK development moved into the
[subtensor monorepo](https://github.com/RaoFoundation/subtensor) (`sdk/python`), which is what
ships to PyPI as Bittensor 11. Old v10 releases remain installable, but nothing new is cut from
the old repo.
:::

---

## Step 3b: The Second venv (For Subnet Miner Code)

This one surprises people, so read it before you hit the error.

`btcli` runs on **Bittensor 11**. But subnet miner repos haven't all migrated yet — Data Universe
(SN13), the subnet you'll mine in TH5, still pins **`bittensor==10.3.0`**. SDK 10 and SDK 11
cannot coexist in one environment.

So you keep **two** virtual environments:

| venv | Install | Used for |
|---|---|---|
| `~/.venvs/bt` | `bittensor` (11.x) | `btcli` — wallets, registration, balances, metagraph |
| `~/.venvs/sn13` | `bittensor==10.3.0` | running the SN13 miner code |

Create the second one now (you'll populate the repo in TH5):

```bash
deactivate 2>/dev/null

python3 -m venv ~/.venvs/sn13
source ~/.venvs/sn13/bin/activate
pip install --upgrade pip
pip install "bittensor==10.3.0"

python -c "import bittensor; print(bittensor.__version__)"   # 10.3.0
deactivate
```

Add a second alias so switching is painless:

```bash
echo 'alias sn13env="source ~/.venvs/sn13/bin/activate"' >> ~/.bashrc   # or ~/.zprofile on macOS
```

:::tip How to tell which venv you need
- Command starts with **`btcli`** → `btenv` (Bittensor 11)
- Command starts with **`python ./neurons/miner.py`** → `sn13env` (SDK 10.3.0)

You'll also notice the flags differ: btcli v11 uses `-w` / `-H` / `-n`, while the miner script
uses the older `--wallet.name` / `--wallet.hotkey` argparse style. That's not an inconsistency in
this guide — they're two programs on two different SDK majors.
:::

---

## ✅ Step 4: Verify the Installation

```bash
source ~/.venvs/bt/bin/activate

# Verify btcli
btcli --help
# Should show help text with the list of commands

# Verify btcli version
btcli --version
# Output: 11.x.x

# Verify the SDK (same package)
python -c "import bittensor; print('bittensor version:', bittensor.__version__)"
# Output: bittensor version: 11.1.0 (or newer 11.x)
```

Normal `btcli --help` output (v11 groups commands into sections):

```text
 Usage: btcli [OPTIONS] COMMAND [ARGS]...

 btcli - a lean command line for the Bittensor chain.

╭─ Commands ──────────────────────────────────────────────╮
│ wallet      Create and manage wallets.                  │
│ stake       Query and manage stake.                     │
│ subnets     Inspect subnets.                            │
│ config      Read and write persistent CLI config.       │
╰─────────────────────────────────────────────────────────╯
╭─ Raw chain access & agents ─────────────────────────────╮
│ query       Query chain state (generated from reads).   │
│ tx          Submit transactions (generated from intents)│
│ explain     Long-form explanation of an error code.     │
╰─────────────────────────────────────────────────────────╯
```

:::tip If You See `btcli: command not found`
The venv isn't active. Run:
```bash
source ~/.venvs/bt/bin/activate
```
And try again.
:::

---

## Step 4b: Fix SSL on macOS (Very Common)

If any btcli command that talks to the chain fails like this:

```text
error: could not reach test: could not connect to any endpoint:
[SSL: CERTIFICATE_VERIFY_FAILED] certificate verify failed:
unable to get local issuer certificate (_ssl.c:1081)
```

…your Python has **no root certificates wired up**. This is not a Bittensor bug and not a network
problem: Python installed from **python.org** does not use the macOS system keychain, and ships
with an empty cert directory until you run its installer script once.

Confirm it:

```bash
python3 -c "import ssl; print(ssl.get_default_verify_paths())"
# cafile=None and capath=None  ->  this is the problem
```

Fix it by running the installer that ships with your Python version:

```bash
"/Applications/Python 3.12/Install Certificates.command"
```

That script pip-installs `certifi` and symlinks Python's expected `cert.pem` at the certifi
bundle. Verify:

```bash
python3 -c "
import ssl, socket
ctx = ssl.create_default_context()
with socket.create_connection(('test.finney.opentensor.ai', 443), timeout=15) as s:
    ctx.wrap_socket(s, server_hostname='test.finney.opentensor.ai')
print('TLS OK')
"
```

:::note Match the version number
Use the folder matching the Python that runs btcli — check with `head -1 $(which btcli)`. If you
installed Python via **Homebrew** or **pyenv** instead, you generally won't hit this; those builds
use a cert store already.
:::

:::warning The old fix no longer works
Pre-v11 guides suggest `python -m bittensor certifi`. That was removed — in Bittensor 11 it fails
with `No module named bittensor.__main__`. Use the `Install Certificates.command` route above.
:::

---

## Step 4c: Check You Only Have ONE btcli

This bites people who used Bittensor before v11:

```bash
which -a btcli
```

If more than one path comes back, you have competing installs — commonly a Homebrew `btcli`
(v9.x) alongside the v11 one from pip. Whichever appears **first** wins, and v9 will reject every
command in this guidebook with `No such option: --wallet`.

```bash
# what version is each one?
head -1 $(which btcli)     # shows which python it belongs to
btcli --version            # must be 11.x.x

# remove a stale Homebrew copy
brew uninstall btcli
```

---

## Step 4d: Persistent Config

v11 stores CLI defaults in `~/.bittensor/btcli.json` (the v9 `config.yml` is ignored):

```bash
btcli config set network test
btcli config set wallet my_coldkey
btcli config get
btcli config path
```

:::note "legacy (v9) btcli config" warning
If you used btcli v9 on this machine, the first v11 run warns that `~/.bittensor/config.yml` is
ignored. Re-set what you need with `btcli config set`, then rename or delete the old file to
silence the warning. Your **wallets** are untouched by this — only CLI defaults moved.
:::

---

## Install Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `error: Microsoft Visual C++ 14.0 required` | You're on Windows without WSL2 | Switch to the WSL2 Ubuntu terminal |
| `failed building wheel for cryptography` | Missing dev headers | `sudo apt install libssl-dev libffi-dev python3-dev` |
| `pip: command not found` | pip isn't in the venv's PATH | `python3 -m ensurepip --upgrade` |
| `btcli: command not found` | venv not active | `source ~/.venvs/bt/bin/activate` |
| `ModuleNotFoundError: 'bittensor'` | SDK not installed or wrong venv | Make sure venv is active, then `pip install bittensor` |
| `ERROR: Could not find a version that satisfies the requirement bittensor` | Network issue / PyPI timeout | `pip install bittensor --retries 5` |
| `ImportError: cannot import name 'X' from 'bittensor'` | Running **miner code** against SDK 11 | Miner code needs the pinned venv: `sn13env`, which has `bittensor==10.3.0` |
| Two different `btcli` versions on PATH | Old `bittensor-cli` still installed | `pip uninstall -y bittensor-cli bittensor-wallet` |
| `requires-python` mismatch on install | Python outside 3.10–3.14 | Bittensor 11 requires `>=3.10,<3.15` |
| `SSL: CERTIFICATE_VERIFY_FAILED` on any chain command | python.org Python has no root certs wired up | Run `"/Applications/Python 3.12/Install Certificates.command"` (see Step 4b) |
| `No such option: --wallet` | An old v9 `btcli` is first on your PATH | `which -a btcli`, then remove the stale one (see Step 4c) |

---

## Quick Reference: Daily Commands

```bash
# Activate the btcli venv (Bittensor 11)
source ~/.venvs/bt/bin/activate   # or: btenv

# Activate the miner venv (SDK 10.3.0)
source ~/.venvs/sn13/bin/activate # or: sn13env

# Deactivate whichever is active
deactivate

# Check what's installed in the current venv
pip list | grep -i bittensor

# Update btcli + SDK together (they're one package now)
pip install --upgrade bittensor
```

---

## Summary

- **Python 3.10–3.14** — Bittensor 11 declares `>=3.10,<3.15`
- Since v11 there is **one package**: `pip install bittensor` gives you the SDK, the wallet, and `btcli`
- `bittensor-cli` and `bittensor-wallet` are **archived** — uninstall them if present
- You keep **two venvs**: `~/.venvs/bt` (v11, for btcli) and `~/.venvs/sn13` (10.3.0, for miner code)
- The `btenv` / `sn13env` aliases make switching easier

---

**Next:** [Wallet Setup (Coldkey & Hotkey) →](/TH4-Wallets-and-Miner-Setup/creating-wallets)

*A clean environment = easy debugging. *
