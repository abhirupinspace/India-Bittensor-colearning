---
title: 'Creating Wallets'
sidebar_position: 3
description: 'Hands-on: create a Bittensor coldkey and hotkey with btcli, back up the mnemonic, verify the wallet, and restore from mnemonic if needed.'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Creating Wallets

:::info Goal
By the end of this page you will have:
- A **coldkey + hotkey** created via btcli
- Your **mnemonic backed up** safely (not on the computer)
- A **verified wallet** you can see with `btcli wallet list` / `overview`
:::

:::note Need the concepts first?
This is the **do-it** page. For the conceptual background — coldkey vs hotkey, the security model, the wallet directory structure — see **TH2 "Wallets: Coldkeys & Hotkeys"**.
:::

:::note Prerequisites
- ✅ btcli installed and `btcli --help` works
- ✅ venv active: `source ~/bittensor-env/bin/activate`
:::

---

## Step 1: Create the Coldkey

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

## Step 2: Create a Hotkey (If You Don't Have One)

If you already have a wallet but no hotkey, or you want a separate hotkey per subnet, create one manually:

```bash
btcli wallet new_hotkey --wallet-name mywallet --hotkey miner1
```

:::important Keep the Hotkey Name Consistent
Use the **same** name across all the following steps. These docs use `miner1` as the example: make sure your hotkey name matches across registration and running the miner.

To see existing hotkeys:
```bash
btcli wallet list
```
:::

The hotkey also has its own mnemonic: back it up too, although it's not as critical as the coldkey.

---

## Step 3: Verify the Wallet

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

## Wallet File Location

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

## Wallet Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Wallet not found` | Wrong wallet name | Check: `btcli wallet list` |
| `Invalid password` | Password typo | Try again: 3 wrong attempts triggers a cooldown |
| `Wallet file corrupted` | File damaged | Restore from mnemonic: `btcli wallet regen_coldkey` |

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

## Summary

- Wallet creation command: `btcli wallet create --wallet-name mywallet --hotkey miner1`
- Back up the **24-word mnemonic on physical paper**: there's no other recovery
- Verify with `btcli wallet list` and `btcli wallet overview --wallet-name mywallet`
- Lost the file? Restore with `btcli wallet regen_coldkey` and your mnemonic

### ✅ Quick Check

1. What single command creates both a coldkey and a hotkey?
2. What does btcli display during coldkey creation that you must write on paper?
3. Which two commands verify your wallet exists and show its hotkeys?
4. What happens if you forget the coldkey password but you have the mnemonic?

---

*Your keys, your TAO.*
