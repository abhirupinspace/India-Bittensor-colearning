---
sidebar_position: 3
title: '🔐 Unit 3: Wallet Setup (Coldkey & Hotkey)'
description: 'Create a Bittensor wallet with coldkey and hotkey, understand the difference, back up your mnemonic safely, and get free testnet TAO from the faucet.'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 🔐 Unit 3: Wallet Setup (Coldkey & Hotkey)

:::info Goal of This Unit
By the end of this unit you will:
- Understand the **difference between coldkey and hotkey** and why both are needed
- Have a **coldkey + hotkey** created via btcli
- Have your **mnemonic backed up** safely (not on the computer)
- Have **testnet TAO** from the faucet so you can register
:::

:::note Prerequisites
- ✅ [Unit 2](./installing-btcli) complete: btcli installed and `btcli --help` works
- ✅ venv active: `source ~/bittensor-env/bin/activate`
:::

---

## 🔑 Coldkey vs Hotkey: Understand Before Creating

Bittensor splits wallet operations into two security layers:

| | **Coldkey** | **Hotkey** |
|---|---|---|
| **Function** | Main vault: holds TAO | Worker key: miner operations |
| **Actions that require coldkey** | Transfer TAO, stake/unstake, register miner | — |
| **Actions that require hotkey** | — | Sign validator queries, emit data |
| **Must be online?** | As rarely as possible | 24/7 active while the miner runs |
| **Where to store?** | Locally, not on a VPS/server | OK to live on a server (VPS/local) |
| **If lost?** | Lose access to all TAO | Can create a new hotkey |

:::danger Coldkey = the Lifeline of Your TAO
Anyone who has the **coldkey mnemonic** has full control of all the TAO in your wallet. Never share it with anyone, including "Bittensor admins" on Discord/Telegram: those are scammers.
:::

---

## 👜 Step 1: Create the Coldkey

Activate the venv first:

```bash
source ~/bittensor-env/bin/activate
```

Create the coldkey with a wallet name:

```bash
btcli wallet create --wallet-name mywallet --hotkey miner1
```

This command will:
1. Ask you to confirm the wallet name
2. Create a **coldkey** and display the **24-word mnemonic**
3. Ask you to set a **password** to encrypt the local coldkey file
4. Create a **hotkey** named `miner1` at the same time

:::warning Write the Mnemonic Down Now!
When btcli displays the 24-word mnemonic: **write it on physical paper**, not in:
- ❌ Screenshots
- ❌ A text file on your computer
- ❌ WhatsApp/Telegram chats
- ❌ Cloud notes (Google Keep, Notion, etc.)

Store the paper somewhere safe. The mnemonic is the only way to recover the wallet if the file is lost or your computer breaks.
:::

---

## 👜 Step 2: Create a Hotkey (If You Don't Have One)

If you already have a wallet but no hotkey, or you want a separate hotkey per subnet, create one manually:

```bash
btcli wallet new_hotkey --wallet-name mywallet --hotkey miner1
```

:::important Keep the Hotkey Name Consistent
Use the **same** name across all the following units. These docs use `miner1` as the example: make sure your hotkey name matches across Unit 4 (registration) and Unit 5 (running the miner).

To see existing hotkeys:
```bash
btcli wallet list
```
:::

The hotkey also has its own mnemonic: back it up too, although it's not as critical as the coldkey.

---

## 📋 Step 3: Verify the Wallet

```bash
# List all wallets
btcli wallet list

# Wallet overview (balance & hotkeys)
btcli wallet overview --wallet-name mywallet
```

`btcli wallet list` output:

```text
Wallets
└── mywallet  (~/. bittensor/wallets/mywallet)
    └── miner1
```

`btcli wallet overview` output:

```text
Wallet: mywallet
  coldkeypub: 5Gx1...abcd
  balance: τ 0.000000

  Hotkeys:
  ┌────────────────┬────────────────────────────────────────────────────┬────────┐
  │ Hotkey         │ Address                                            │ Stake  │
  ├────────────────┼────────────────────────────────────────────────────┼────────┤
  │ miner1         │ 5Gx1...xyz9                                        │ τ 0.00 │
  └────────────────┴────────────────────────────────────────────────────┴────────┘
```

---

## 📁 Wallet File Location

The wallet is stored at:

```
~/.bittensor/wallets/
└── mywallet/
    ├── coldkey          ← encrypted file (requires password)
    ├── coldkeypub.txt   ← public key (safe to share)
    └── hotkeys/
        └── miner1       ← hotkey (encrypted)
```

:::tip Back Up the Wallet Files
In addition to the mnemonic, also back up the `~/.bittensor/wallets/` folder to a USB drive or encrypted cloud storage. But remember: **the file alone is not enough** if you forget the password: the mnemonic remains the primary backup.
:::

---

## 🚰 Step 4: Get Testnet TAO From the Faucet

To register a miner on the testnet, you need a small amount of testnet TAO (no need to buy: it's free from the faucet).

### Option A: Miners Union Faucet (Easiest)

1. Open in your browser: **app.minersunion.ai/testnet-faucet**
2. Enter your **coldkey public address** (from `btcli wallet overview` output, the `coldkeypub` line)
3. Click "Request TAO"
4. Wait a few minutes

Verify after a few minutes:

```bash
btcli wallet balance --wallet-name mywallet --network test
```

### Option B: Bittensor Discord Faucet

1. Join the Bittensor Discord: **discord.gg/bittensor**
2. Go to the **#requests-for-testnet-tao** channel (or whichever active faucet channel)
3. Post your coldkey public address in the requested format
4. A bot or moderator will send testnet TAO

:::note How Much Testnet TAO Is Needed?
Registration fees on testnet netuid 1 vary: typically very cheap. **1 τ testnet** is plenty for several registration attempts.

Note: POW registration is disabled on NetUID 1, so testnet TAO from the faucet is required.
:::

---

## 🔒 Step 5: Basic Wallet Security

### Browser Extension Wallet (Optional)

Aside from btcli, you can use the **Bittensor Wallet Extension** on Chrome/Brave to monitor your balance via UI:

- Search "Bittensor Wallet" on the Chrome Web Store (verify it's the official developer)
- Import the wallet using your coldkey mnemonic

:::warning Verify the Extension!
Always check that the extension you install is from the official publisher. There are many fake extensions that steal mnemonics. Look at downloads and reviews.
:::

### Anti-Scam Checklist

Bittensor has a large community but also many scammers. Remember:

- ❌ **No real Bittensor admin DMs you first** to help you set up
- ❌ **No "double your TAO" scheme is ever legit**
- ❌ **Never type your mnemonic on any website** other than your local btcli
- ❌ **Don't share screen** while your wallet is open with people you don't know
- ✅ Real community admins only help in public channels, not in private DMs

---

## 🐛 Wallet Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Wallet not found` | Wrong wallet name | Check: `btcli wallet list` |
| `Invalid password` | Password typo | Try again: 3 wrong attempts triggers a cooldown |
| `Wallet file corrupted` | File damaged | Restore from mnemonic: `btcli wallet regen_coldkey` |
| Testnet balance doesn't show | Faucet not yet processed / network delay | Wait 5 minutes, check again |
| `Connection refused` to testnet | Subtensor testnet down | Try later or check status on Discord |

### Restore a Wallet From Mnemonic

If you switch computers or the file is lost:

```bash
# Restore coldkey
btcli wallet regen_coldkey --wallet-name mywallet
# Will ask for your 24-word mnemonic

# Restore hotkey
btcli wallet regen_hotkey --wallet-name mywallet --hotkey miner1
# Will ask for the hotkey mnemonic
```

---

## 🎯 Summary

- **Coldkey** = TAO vault, only activate when needed for transfer/stake/register
- **Hotkey** = worker key, OK to live on the server, used 24/7 by the miner
- Wallet creation command: `btcli wallet create --wallet-name mywallet --hotkey miner1`
- Back up the **24-word mnemonic on physical paper**: there's no other recovery
- Free testnet TAO from **app.minersunion.ai/testnet-faucet** or the Bittensor Discord

### ✅ Quick Check

1. What's the functional difference between a coldkey and a hotkey?
2. Why store the mnemonic on paper, not in a digital file?
3. Where is the default wallet file location on your system?
4. What happens if you forget the coldkey password but you have the mnemonic?

<details>
<summary>💡 Answers</summary>

1. **Coldkey** = vault, for transferring TAO & registering. **Hotkey** = worker, for miner operations & query signing.
2. Digital files are vulnerable: hacking, cloud sync, screenshots → exposure. Paper offline = safest for seed phrases.
3. Default: `~/.bittensor/wallets/<wallet_name>/`
4. You can restore: `btcli wallet regen_coldkey` → enter the mnemonic → set a new password.

</details>

---

**Next:** [Unit 4: Register the Miner on a Testnet Subnet →](./register-subnet-testnet)

*Your keys, your TAO. 🔑*
