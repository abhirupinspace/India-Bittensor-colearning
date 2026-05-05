---
title: 'One-Shot Guide: Zero to SN41 Miner Registered'
description: 'Copy-paste path: install → wallet → testnet TAO → register on Sportstensor testnet (netuid 172). Commands only.'
slug: /one-shot
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# One-Shot: Zero → SN41 Registered

Run top to bottom. Submission spec at §6.

:::tip Graduation Quest
Finish this → submit proof → graduate **India Co-Learning Camp #20 – Bittensor Edition**.
:::

---

## 1. Prereqs

- **OS:** Linux / macOS / **WSL2** on Windows (native Windows ❌)
- **Python:** 3.9–3.12

**Windows → install WSL2** (PowerShell as admin):
```powershell
wsl --install -d Ubuntu-22.04
# reboot, then run all later commands inside Ubuntu
```

**Install Python:**
```bash
# macOS
brew install python@3.11

# Ubuntu / WSL2
sudo apt update && sudo apt install -y python3.11 python3.11-venv build-essential git curl
```

## 2. Install btcli

```bash
pip install bittensor-cli

btcli --version    # expect: BTCLI version: 9.x.x
```

## 3. Create coldkey + hotkey

```bash
btcli wallet create --wallet-name my_first_coldkey --hotkey my_first_hotkey
```

Prompts:

| Prompt | Answer |
|---|---|
| `Enter the path of wallets directory` | press Enter (default `~/.bittensor/wallets/`) |
| `Choose the number of words [12/15/18/21/24]` | `12` |
| **Coldkey mnemonic shown** | write on **paper**, store offline |
| `Enter your password` / retype | strong password (separate from mnemonic) |
| **Hotkey mnemonic shown** | write on **paper** |

Verify:
```bash
btcli wallet list
```
Note the **coldkey SS58** and **hotkey SS58**.

:::warning
Anyone with the coldkey mnemonic owns your funds. No screenshots, no cloud, no DMs.
:::

## 4. Testnet TAO

Open `https://app.minersunion.ai/testnet-faucet` → paste **coldkey SS58** (not hotkey) → submit.

Wait ~5 min, then:
```bash
btcli wallet balance --wallet-name my_first_coldkey --network test
```

Expect a non-zero `τ` balance.

## 5. Register on SN41 testnet (netuid 172)

```bash
btcli subnet register \
  --netuid 172 \
  --wallet.name my_first_coldkey \
  --wallet.hotkey my_first_hotkey \
  --network test
```

Confirm prompt with `y`, then enter coldkey password.

**Success output:**
```
✅ Your extrinsic has been included as 6190523-9
Balance: 10.0000 τ ➡ 9.9992 τ
✅ Registered on netuid 172 with UID <N>
```

**Example — what your terminal should look like:**

<img
  src={useBaseUrl('/img/one-shot/registered-uid-50.png')}
  alt="btcli subnet register output showing UID 50 on netuid 172"
  style={{maxWidth: '100%', borderRadius: 6, border: '1px solid #DBDDE1'}}
/>

**Screenshot this terminal now** — it contains hotkey, coldkey, netuid 172, UID, and `✅ Registered`. That's your submission proof.

> Mainnet instead? Drop `--network test` and use `--netuid 41`. Costs real TAO.

---

## 6. Submission

| # | Field | Source |
|---|---|---|
| 1 | **Hotkey Address** | `btcli wallet list` → hotkey SS58 |
| 2 | **Subnet ID / NetUID** | `172` (testnet) — or `41` (mainnet) |
| 3 | **Miner UID** | from §5 output (`Registered on netuid 172 with UID <N>`) — or `btcli neuron list --netuid 172 --network test` |
| 4 | **Miner Screenshot** | the §5 registration output (covers hotkey + netuid + UID + ✅) |
| 5 | **X Post** | tag `@HackQuest_` `@HackQuestIN` `@bittensor` |

---

## Pro tips

- Use **coldkey** (not hotkey) for the faucet
- Verify `--netuid 172` + `--network test` before pressing `y` — fees are non-refundable
- Crash? Re-run §5 — most failures are wrong netuid or empty wallet

Stuck? → [Day 2 — Wallet Setup](../Day-2-Tooling-and-Ecosystem/wallet-setup) · [Day 3 — Register Miner](../Day-3-Testnet-and-Registration/register-miner) · [Resources](/resources)
