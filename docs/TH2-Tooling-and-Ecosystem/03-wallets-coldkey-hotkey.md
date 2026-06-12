---
title: 'Wallets: Coldkeys & Hotkeys'
sidebar_position: 3
description: 'Understand Bittensor wallets: coldkey vs hotkey, the two-layer security model, the wallet file/directory structure, and why the mnemonic backup matters.'
---

# Wallets: Coldkeys & Hotkeys

:::info Goal
By the end of this page you will:
- Understand the **difference between coldkey and hotkey** and why both are needed
- Understand the **two-layer security model** behind a Bittensor wallet
- Know the **wallet file/directory structure** on disk
- Understand **why the mnemonic backup matters** more than the wallet file itself
:::

:::note Hands-on creation lives in TH4
This page is about **understanding** wallets. The hands-on steps to actually create a coldkey and hotkey are in **TH4 "Creating Wallets"**.
:::

---

## Coldkey vs Hotkey: Understand Before Creating

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

## Why the Mnemonic Backup Matters

When a coldkey is created, btcli displays a **24-word mnemonic**. This is the **only way to recover** the wallet if the file is lost or your computer breaks.

:::warning Write the Mnemonic Down — On Paper
When btcli displays the 24-word mnemonic: **write it on physical paper**, not in:
- ❌ Screenshots
- ❌ A text file on your computer
- ❌ WhatsApp/Telegram chats
- ❌ Cloud notes (Google Keep, Notion, etc.)

Store the paper somewhere safe. Digital files are vulnerable: hacking, cloud sync, and screenshots all lead to exposure. Paper kept offline is the safest place for a seed phrase.
:::

The hotkey also has its own mnemonic. Back it up too, although it's not as critical as the coldkey.

---

## Summary

- **Coldkey** = TAO vault, only activate when needed for transfer/stake/register
- **Hotkey** = worker key, OK to live on the server, used 24/7 by the miner
- Wallet files live at `~/.bittensor/wallets/<wallet_name>/`
- Back up the **24-word mnemonic on physical paper**: there's no other recovery
- Ready to create one? Head to **TH4 "Creating Wallets"** for the hands-on steps

### ✅ Quick Check

1. What's the functional difference between a coldkey and a hotkey?
2. Why store the mnemonic on paper, not in a digital file?
3. Where is the default wallet file location on your system?
4. What happens if you forget the coldkey password but you have the mnemonic?

<details>
<summary> Answers</summary>

1. **Coldkey** = vault, for transferring TAO & registering. **Hotkey** = worker, for miner operations & query signing.
2. Digital files are vulnerable: hacking, cloud sync, screenshots → exposure. Paper offline = safest for seed phrases.
3. Default: `~/.bittensor/wallets/<wallet_name>/`
4. You can restore: `btcli wallet regen_coldkey` → enter the mnemonic → set a new password.

</details>
