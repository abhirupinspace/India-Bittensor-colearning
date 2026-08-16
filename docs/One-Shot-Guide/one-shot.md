---
title: 'One-Shot Guide: Zero to SN13 Miner Registered'
description: 'Copy-paste path: install Bittensor 11 → wallet → testnet TAO → register on Data Universe testnet (netuid 13). Commands only.'
slug: /one-shot
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# One-Shot: Zero → SN13 Registered

Run top to bottom. Submission spec at §6.

:::tip Graduation Quest
Finish this → submit proof → graduate **India Co-Learning Camp #23 – Bittensor Edition**.
:::

---

## 1. Prereqs

- **OS:** Linux / macOS / **WSL2** on Windows (native Windows ❌)
- **Python:** 3.10–3.14 (Bittensor 11 requires `>=3.10,<3.15`)

**Windows → install WSL2** (PowerShell as admin):
```powershell
wsl --install -d Ubuntu-22.04
# reboot, then run all later commands inside Ubuntu
```

**Install Python:**
```bash
# macOS
brew install python@3.12

# Ubuntu / WSL2
sudo apt update && sudo apt install -y python3.12 python3.12-venv build-essential git curl
```

## 2. Install Bittensor 11

One package now ships the SDK, the wallet, **and** `btcli`.

```bash
python3 -m venv ~/.venvs/bt
source ~/.venvs/bt/bin/activate

pip install --upgrade pip
pip install bittensor

btcli --version    # expect: 11.x.x
```

:::danger Uninstall the old packages first
If you ever installed `bittensor-cli` or `bittensor-wallet`, remove them or you will get a
conflicting `btcli` on your PATH:

```bash
pip uninstall -y bittensor-cli bittensor-wallet
pip install -U bittensor
```

Both packages were archived upstream in July 2026 and are no longer maintained.
:::

:::note Legacy config warning
If you used btcli v9 before, the first run prints a warning that `~/.bittensor/config.yml` is
ignored. v11 stores config in `~/.bittensor/btcli.json`. Re-set what you need with
`btcli config set`, then delete the old file to silence it.
:::

## 3. Create coldkey + hotkey

```bash
btcli wallet create -w my_first_coldkey -H my_first_hotkey
```

Prompts:

| Prompt | Answer |
|---|---|
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

There is no public web faucet — the old `faucet.bittensor.com` is gone and `btcli` has no
`faucet` command. Test TAO is requested from the community:

1. Join the [Bittensor Discord](https://discord.gg/qasY3HA9F9).
2. Find the testnet-faucet request channel.
3. Post your **coldkey SS58** (never the mnemonic) and say you are a Co-Learning Camp participant.

Once funded:
```bash
btcli wallet balance my_first_coldkey -n test
```

Expect a non-zero `τ` balance.

:::warning Ask for more than the burn cost
The burn cost is tiny (~τ0.0005 on testnet), but that is **not** all you need. Registration is
always submitted **MEV-shielded**, and a shielded submission needs additional free TAO for the
*outer carrier fee*. Fund with a comfortable margin — a few test τ, not exactly the burn cost.

With a zero balance you'll get:

```text
error: MEV-shielded submission needs free TAO for the outer carrier fee
  help: burned_register cannot submit unshielded
```
:::

## 5. Register on SN13 testnet (netuid 13)

Check the current burn cost first — it floats per block, and fees are non-refundable:

```bash
btcli subnets burn-cost 13 -n test
```

Preview the registration without submitting:

```bash
btcli subnets register --netuid 13 -w my_first_coldkey -H my_first_hotkey -n test --dry-run
```

:::tip Always dry-run first
`--dry-run` costs nothing and catches an underfunded wallet *before* you spend anything. If it
errors, fix the balance and re-run it until it previews cleanly.

Don't try to work around a shielding error with `--no-mev-shield` — burned registration rejects it
outright: `burned_register must be submitted MEV-shielded`.
:::

Then register for real:

```bash
btcli subnets register --netuid 13 -w my_first_coldkey -H my_first_hotkey -n test
```

Confirm prompt with `y`, then enter coldkey password.

**Success output:**
```
✅ Your extrinsic has been included as 7420389-7
Balance: 10.0000 τ ➡ 9.9929 τ
✅ Registered on netuid 13 with UID <N>
```

**Example — what your terminal should look like:**

<img
  src={useBaseUrl('/img/one-shot/registered-example.jpeg')}
  alt="btcli subnets register success output ending in ✅ Registered with a UID"
  style={{maxWidth: '100%', borderRadius: 6, border: '1px solid #DBDDE1'}}
/>

<small>_Example run on testnet netuid 13. The screenshot is from btcli v9, so the flags shown differ from the v11 commands above — the flow is the same: confirm `y` → password → `✅ Registered … with UID <N>`._</small>

**Screenshot this terminal now** — it contains hotkey, coldkey, netuid 13, UID, and `✅ Registered`. That's your submission proof.

> Mainnet instead? SN13 is **netuid 13 on both** testnet and mainnet — the only difference is the network flag. Drop `-n test` to use mainnet. Costs real TAO.

:::note Registering ≠ mining
This gets you a UID — a seat on the subnet. Actually earning emissions means running the SN13
miner, which needs its own pinned environment. See
[Running the SN13 Miner](/TH5-Running-a-Miner/running-the-sn13-miner).
:::

---

## 6. Submission

| # | Field | Source |
|---|---|---|
| 1 | **Hotkey Address** | `btcli wallet list` → hotkey SS58 |
| 2 | **Subnet ID / NetUID** | `13` (testnet, with `-n test`) — or `13` (mainnet) |
| 3 | **Miner UID** | from §5 output (`Registered on netuid 13 with UID <N>`) — or `btcli subnets metagraph 13 -n test` |
| 4 | **Miner Screenshot** | the §5 registration output (covers hotkey + netuid + UID + ✅) |
| 5 | **X Post** | tag `@HackQuest_` `@HackQuestIN` `@bittensor` |

---

## Pro tips

- Use **coldkey** (not hotkey) for the faucet request
- Run `--dry-run` first, and verify `--netuid 13` + `-n test` before pressing `y` — fees are non-refundable
- Crash? Re-run §5 — most failures are wrong netuid, an old btcli still on PATH, or an empty wallet
- `btcli explain <ERROR_CODE>` gives a long-form explanation of any v11 error code

Stuck? → [Creating Wallets](/TH4-Wallets-and-Miner-Setup/creating-wallets) · [Registering a Miner](/TH5-Running-a-Miner/registering-a-miner) · [Resources](/resources)
