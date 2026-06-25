---
title: 'One-Shot Guide: Zero to SN41 Miner Registered'
description: 'Copy-paste path: install → wallet → testnet TAO → register on Sportstensor testnet (netuid 41). Commands only.'
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

:::tip Use a recent btcli (≥ 9.22)
The SN41 testnet runs a newer chain runtime. Older btcli (e.g. 9.17) fails on testnet reads with `Storage function "Swap.AlphaSqrtPrice" not found`. If you hit that, upgrade: `pip install -U bittensor-cli` (or `brew upgrade btcli`).
:::

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

:::note If balance errors on testnet
On current testnet, `wallet balance` / `wallet overview` may fail with `Storage function "Swap.AlphaSqrtPrice" not found` even on a recent btcli — it's a chain-side issue, not your wallet. **You can ignore it:** §5's register step prints `Your balance is: …` before it charges, so you'll see your balance there.
:::

## 5. Register on SN41 testnet (netuid 41)

```bash
btcli subnet register \
  --netuid 41 \
  --wallet.name my_first_coldkey \
  --wallet.hotkey my_first_hotkey \
  --network test
```

Confirm prompt with `y`, then enter coldkey password.

**Success output:**
```
✅ Your extrinsic has been included as 7420389-7
Balance: 10.0000 τ ➡ 9.9929 τ
✅ Registered on netuid 41 with UID <N>
```

**Example — what your terminal should look like:**

<img
  src={useBaseUrl('/img/one-shot/registered-example.jpeg')}
  alt="btcli subnet register success output ending in ✅ Registered with a UID"
  style={{maxWidth: '100%', borderRadius: 6, border: '1px solid #DBDDE1'}}
/>

<small>_Example run on testnet (shown here on netuid 13) — the flow is identical for `--netuid 41`: confirm `y` → password → `✅ Registered … with UID <N>`._</small>

**Screenshot this terminal now** — it contains hotkey, coldkey, netuid 41, UID, and `✅ Registered`. That's your submission proof.

> Mainnet instead? SN41 is **netuid 41 on both** testnet and mainnet — the only difference is the network flag. Drop `--network test` to use mainnet. Costs real TAO.

---

## 6. Submission

| # | Field | Source |
|---|---|---|
| 1 | **Hotkey Address** | `btcli wallet list` → hotkey SS58 |
| 2 | **Subnet ID / NetUID** | `41` (testnet, with `--network test`) — or `41` (mainnet) |
| 3 | **Miner UID** | from §5 output (`Registered on netuid 41 with UID <N>`) — or `btcli subnet metagraph --netuid 41 --network test` |
| 4 | **Miner Screenshot** | the §5 registration output (covers hotkey + netuid + UID + ✅) |
| 5 | **X Post** | tag `@HackQuest_` `@HackQuestIN` `@bittensor` |

---

## Pro tips

- Use **coldkey** (not hotkey) for the faucet
- Verify `--netuid 41` + `--network test` before pressing `y` — fees are non-refundable
- Crash? Re-run §5 — most failures are wrong netuid, stale btcli, or empty wallet

Stuck? → [Creating Wallets](/TH4-Wallets-and-Miner-Setup/creating-wallets) · [Registering a Miner](/TH5-Running-a-Miner/registering-a-miner) · [Resources](/resources)
