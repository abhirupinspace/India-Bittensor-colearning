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

## Key Material

Both keys are **sr25519** keypairs, addressed with **SS58 network prefix 42**. That's why every
Bittensor address starts with `5` — if an address doesn't start with `5`, it isn't a Bittensor
address.

Each key is generated from a mnemonic (**12 words by default**). That mnemonic is the *only*
recovery path. The wallet password merely decrypts the coldkey file **on one machine** — it
cannot regenerate a lost key, and you don't need it to restore from a mnemonic.

---

## Wallet File Location

The wallet is stored at `~/.bittensor/wallets/<wallet-name>/`:

```
~/.bittensor/wallets/
└── mywallet/
    ├── coldkey          ← coldkey secret, password-encrypted (NaCl)
    ├── coldkeypub.txt   ← public key + ss58 address, unencrypted (no secrets)
    └── hotkeys/
        └── miner1       ← hotkey, UNENCRYPTED plaintext (private key + mnemonic)
```

:::danger Hotkey files are NOT encrypted
This surprises almost everyone. The SDK's create and regen helpers always write hotkeys in
**plaintext** — private key and mnemonic included. There is no password on a hotkey file.

**Treat every hotkey file as readable by anything that can read the disk.** That's the real reason
a hotkey belongs on the miner server and a coldkey does not: the hotkey is not protected by
anything except filesystem permissions.
:::

:::tip Back Up the Wallet Files — Carefully
The mnemonic is the primary backup. If you also back up the `~/.bittensor/wallets/` folder,
remember you are copying **plaintext hotkey secrets** along with it. A digital backup belongs on
an **encrypted offline drive** (GPG or VeraCrypt, strong unique passphrase) that you only ever
connect to a trusted, offline machine — not ordinary cloud storage.
:::

---

## Why the Mnemonic Backup Matters

When a coldkey is created, btcli displays its **mnemonic** (12 words by default; you can choose
15/18/21/24). This is the **only way to recover** the wallet if the file is lost or your computer
breaks.

A seed phrase fails in exactly two ways:

- **Loss** — the funds are gone permanently. Nobody, including the Opentensor / Rao Foundation, can recover them.
- **Leak** — anyone who saw it can drain the wallet. The response is to rotate keys, fast.

Redundant physical backups defend against loss; handling discipline defends against leak.

:::warning Write the Mnemonic Down — On Paper
When btcli displays the mnemonic: **write it on physical paper**, not in:
- ❌ Screenshots
- ❌ A text file on your computer
- ❌ WhatsApp/Telegram chats
- ❌ Cloud notes (Google Keep, Notion, etc.)

Keep **redundant copies in separate physical locations**, so one fire, flood, or theft can't
destroy every copy. Paper in a tamper-evident envelope in a safe works; a stamped metal plate
survives what paper doesn't.

Also: a "hex-encoded seed" or "private key hex" **is** the seed phrase in another encoding.
Anyone asking for either is asking for your seed phrase. Nobody legitimate ever does. Unsolicited
"support" DMs and "fix your RPC settings" messages are phishing — keep help requests in public
channels.
:::

The hotkey also has its own mnemonic. Back it up too, although it's not as critical as the coldkey.

---

## Address Hygiene

Transfers are **irreversible**, and **address poisoning** exploits that: an attacker grinds a
vanity address whose first and last characters match one you actually transact with, then sends
you a dust transfer so the lookalike sits in your history — waiting for you to copy the wrong
entry.

- Read the **whole** address, not just both ends
- Every Bittensor address starts with `5` (SS58 prefix 42) — anything else isn't one
- Pay from a saved address book (`btcli wallet list` shows yours), never from transaction history
- Treat unexpected dust transfers as hostile
- Send a small **test transaction** before any large transfer

:::danger Always send TAO to a coldkey address
Sending to a **hotkey** address is technically possible but can **strand the funds**. And there is
no undo anywhere in this system — nobody can reverse a theft or recover lost keys.
:::

---

## When a Key Is Compromised

You don't have to abandon everything — Bittensor has rotation built in:

- **Leaked hotkey** — [`swap-hotkey`](https://www.bittensor.com/docs/tx/swap-hotkey) replaces it and carries over its
  registrations and delegated stake. Costs 0.1 TAO across all subnets, or 0.001 TAO on a single
  subnet (limited to once per subnet per ~1 day).
- **Leaked coldkey** — only worth swapping if the coldkey holds registrations or owns a subnet.
  A plain holder or staker should just **transfer everything to a fresh coldkey**. The real swap
  is a deliberately slow two-step: announce (costs 0.1 TAO, starts a ~5-day waiting period during
  which the wallet is locked), then execute. The delay exists so a real owner can **dispute** a
  thief's announcement and freeze the key.

:::tip Don't use the coldkey day-to-day
Proxies exist precisely so routine operations never touch the real coldkey — you delegate a
narrow, revocable permission (`Staking`, `Registration`, …) to a separate key. Keep the primary
coldkey on a hardware or air-gapped signer for recovery and high-impact operations only.
:::

---

## Summary

- **Coldkey** = TAO vault, only activate when needed for transfer/stake/register
- **Hotkey** = worker key, OK to live on the server, used 24/7 by the miner
- Both are **sr25519**, SS58 prefix 42 — every Bittensor address starts with `5`
- Wallet files live at `~/.bittensor/wallets/<wallet_name>/`
- The coldkey file is **encrypted**; hotkey files are **plaintext** — filesystem permissions are their only protection
- Back up the **mnemonic (12 words by default) on physical paper**, in more than one location: there's no other recovery
- Always send TAO to a **coldkey** address; transfers are irreversible
- Ready to create one? Head to **TH4 "Creating Wallets"** for the hands-on steps

### ✅ Quick Check

1. What's the functional difference between a coldkey and a hotkey?
2. Why store the mnemonic on paper, not in a digital file?
3. Where is the default wallet file location, and which files in it contain secrets?
4. What happens if you forget the coldkey password but you have the mnemonic?
5. Someone sends you a tiny unexpected TAO transfer from an address that looks almost like one you use. What's going on?

<details>
<summary> Answers</summary>

1. **Coldkey** = vault, for transferring TAO, staking & registering. **Hotkey** = worker, for miner operations & signing weights/serving.
2. Digital files are vulnerable: hacking, cloud sync, screenshots → exposure. Paper offline, in redundant locations, = safest for seed phrases.
3. Default: `~/.bittensor/wallets/<wallet_name>/`. The `coldkey` file (encrypted) **and every file under `hotkeys/`** (plaintext!) contain secrets. Only `coldkeypub.txt` is safe to share.
4. You can restore: `btcli wallet regen-coldkey` → enter the mnemonic → set a new password. The password only ever decrypted the local file; the mnemonic is the real key.
5. **Address poisoning.** The attacker ground a vanity address matching the first/last characters of one you transact with, and put it in your history hoping you'll copy it. Never pay from transaction history — use a saved address book and read the whole address.

</details>
