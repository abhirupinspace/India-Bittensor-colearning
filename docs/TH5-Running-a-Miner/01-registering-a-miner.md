---
title: 'Registering a Miner'
sidebar_position: 1
description: 'Check the registration cost, run btcli subnet register, handle common errors, and verify your UID is assigned in the Sportstensor metagraph.'
---

# Registering a Miner

:::info What You'll Do
By the end of this section you will:
- Understand the **TAO recycle / burn** mechanism for subnet registration
- Know how to **check the actual registration cost** via `btcli subnet burn_cost`
- Successfully **register your hotkey** on netuid 41 (or testnet netuid)
- Verify your **UID** appears in the metagraph
- Know how to handle common errors (insufficient balance, registration closed, etc.)
:::

:::note Prerequisites
- ✅ [Wallet & TAO Funding](/TH4-Wallets-and-Miner-Setup/getting-ready-for-mining) complete
- ✅ Coldkey `sn41_miner` has balance ≥ 1.5 TAO (mainnet) or ≥ 5 test-τ (testnet)
- ✅ Hotkey `miner_01` already created
- ✅ Stable internet (registration takes 30–90 seconds)
:::

---

## Registration Concept: Burn vs PoW

Bittensor has two historical registration modes. **SN41 currently uses burn (recycle) mode**: more predictable and friendlier for non-professional miners.

```mermaid
flowchart TD
    A[You request registration] --> B{Subnet mode?}
    B -->|Burn / Recycle| C[Pay TAO directly<br/>from coldkey]
    B -->|PoW| D[CPU/GPU hash<br/>until winning a slot]

    C --> E[TAO is burned<br/>enters recycle pool]
    D --> F[Block producer approves]

    E --> G[UID assigned]
    F --> G

    style C fill:#BDC1C6,stroke:#000000
    style G fill:#F1F3F4,stroke:#5F6368
```

### Why Burn?

- **No heavy hardware needed**: just pay
- **Dynamic price**: many people registering → cost rises; few → falls (supply & demand)
- **Burned TAO** goes into the subnet's recycle pool (not destroyed economically: it preserves scarcity)

:::warning TAO Burned = Gone
Once burned, TAO can't be refunded. If you get deregistered later, you **don't get back** the registration cost. This is not a deposit.
:::

---

## Step 1: Check the Registration Cost

### Mainnet (netuid 41)

```bash
btcli subnet burn_cost --netuid 41
```

Output:

```text
Recycle required to register on subnet 41: τ 0.237493921
```

This number is **fluctuating per block** (every ~12 seconds). If it's high right now, wait a few hours.

### Testnet

The Sportstensor testnet typically uses a different netuid (often **netuid 199** or per the team's announcement: **check the official Sportstensor documentation** for confirmation).

```bash
btcli subnet burn_cost --netuid <TESTNET_NETUID> --subtensor.network test
```

:::tip View All Subnets + Prices
```bash
btcli subnet list
```
Shows a table of all active subnets along with the current burn cost. Useful for orientation.
:::

### Pre-flight Checkpoint

Make sure your coldkey balance is at least **1.5× burn cost** + buffer:

```bash
btcli wallet overview --wallet.name sn41_miner
```

If burn cost is `0.24 τ`, minimum balance `~0.4 τ`. **Have an extra buffer** in case the burn cost rises while you're executing.

---

## Step 2: Execute Registration

### Mainnet

```bash
btcli subnet register \
  --netuid 41 \
  --wallet.name sn41_miner \
  --wallet.hotkey miner_01
```

### Testnet (recommended for first-timers)

```bash
btcli subnet register \
  --netuid <TESTNET_NETUID> \
  --wallet.name sn41_miner \
  --wallet.hotkey miner_01 \
  --subtensor.network test
```

btcli will:

1. Show the **current burn cost**.
2. Ask for **confirmation** ("Do you want to continue? [y/N]").
3. Ask for the **coldkey password**.
4. Submit the extrinsic to the chain.
5. Wait for finality (~12–36 seconds).

### Successful Output (Example)

```text
Balance:
  τ 2.000000000  →  τ 1.762506079
✅ Registered
Registered on netuid 41 with UID 142
```

**Record UID 142** (your number will differ): this is your miner identity in the subnet.

### Checkpoint

```bash
btcli wallet overview --wallet.name sn41_miner
```

Expected: balance dropped by burn_cost, and under hotkey `miner_01` the field `uid: <number>` appears.

---

## Step 3: Verify in the Metagraph

The **metagraph** = subnet state snapshot (all miners + validators, UID, stake, weights).

```bash
btcli subnet metagraph --netuid 41
```

Output table (excerpt):

```text
Subnet 41: Sportstensor
  UID  STAKE    RANK     TRUST    INCENTIVE   EMISSION   HOTKEY
  ...
  142  0.0000   0.0000   0.0000   0.0000      0.0000     5Ci...DjL
  ...
```

Find the row whose **hotkey SS58** matches your `btcli wallet list`.

:::tip Filter Directly to Your UID
Pipe grep to find quickly:
```bash
btcli subnet metagraph --netuid 41 | grep "5Ci"
```
(Replace `5Ci` with the first 3–5 characters of your hotkey SS58.)
:::

### What Do the Columns Mean?

| Column | Initial value (just registered) | Will become |
|---|---|---|
| **UID** | Your unique slot number | Stays (until deregistered) |
| **STAKE** | 0 | Rises if you/delegators stake |
| **RANK** | 0 | Rises based on validator scores |
| **TRUST** | 0 | Rises when validators consistently score you positive |
| **INCENTIVE** | 0 | Share of emission based on rank |
| **EMISSION** | 0 | TAO per block you receive |

All columns are zero at the start: **normal**. Takes 1–3 days of active mining to start rising.

---

## Registration & Deregistration Cycle (Immunity Period)

```mermaid
sequenceDiagram
    participant U as You
    participant BC as Blockchain
    participant V as Validator
    participant N as Other new miner

    U->>BC: register (pay burn)
    BC-->>U: UID 142 assigned
    Note over U,BC:  Immunity ~7200 blocks<br/>(~24 hours on mainnet)
    V->>U: query prediction
    U->>V: respond prediction
    V->>BC: submit weights
    Note over BC: after immunity ends:<br/>lowest-scoring miner is deregistered<br/>when a new miner registers
    N->>BC: register
    BC-->>N: UID <lowest-score slot>
```

:::warning Immunity Period = Learning Window
After registering, you get an **immunity period** (~24 hours on mainnet). During this window you won't be deregistered even with a score of 0. Use this time to **set up the miner code** in the sections that follow and don't waste it.
:::

---

## Common Errors & Fixes

### 1. `InsufficientBalance`

```text
Error: Not enough balance to pay for registration.
  required: τ 0.51, available: τ 0.42
```

**Fix:**
- Add TAO from an exchange (mainnet) or faucet (testnet)
- Or wait for burn cost to drop (`watch -n 60 btcli subnet burn_cost --netuid 41`)

### 2. `RegistrationDisabled` / Registration Closed Window

Some subnets have a **registration interval** (not always open). If you see:

```text
Error: Registration is disabled.
```

**Fix:**
- Wait for the next window: typically the subnet team announces on Discord
- Check `btcli subnet list` status column / next registration

### 3. `PriorityIsTooLow` / `TooManyRegistrationsThisBlock`

Means many people are registering in the same block.

**Fix:**
- Try again 1–2 blocks later. btcli auto-retries a few times.
- If persistent, raise gas priority (advanced: typically not needed in burn mode).

### 4. Timeout `connection refused`

```text
Error: Unable to connect to subtensor endpoint.
```

**Fix:**
- Check internet (`ping entrypoint-finney.opentensor.ai`)
- Use a fallback endpoint: `--subtensor.chain_endpoint wss://entrypoint-finney.opentensor.ai:443`

### 5. Wrong Password

```text
Error: Incorrect password for coldkey.
```

**Fix:**
- No reset. If the password is permanently lost → use the mnemonic regen:
  ```bash
  btcli w regen_coldkey --mnemonic "..." --wallet.name sn41_miner_v2
  ```
- This is a new wallet from the same mnemonic: address stays the same (SS58 is deterministic from mnemonic).

---

## Documentation for Graduation

Take screenshots of the following output (you need them for the final submission):

1. `btcli subnet burn_cost --netuid 41` **before** registering
2. The output of `btcli subnet register ...` showing `Registered on netuid 41 with UID <N>`
3. `btcli subnet metagraph --netuid 41 | grep <hotkey_prefix>` showing your UID in the metagraph
4. `btcli wallet overview --wallet.name sn41_miner` (balance after burn)

Save in a local folder `~/bittensor/submission-evidence/03-register/`.

---

## Summary

- ✅ Understand the **burn/recycle** mode: pay TAO → get UID
- ✅ Check burn cost via `btcli subnet burn_cost`
- ✅ Successfully `btcli subnet register --netuid 41 ...`
- ✅ UID assigned
- ✅ Verified the UID appears in `btcli subnet metagraph --netuid 41`
- ✅ Understand the immunity period concept (~24 hour buffer for miner setup)

### ✅ Quick Check

1. What's the difference between **burn** and **PoW** registration modes?
2. What's the minimum number of flags needed for `btcli subnet register` on mainnet?
3. What happens to TAO after burn: lost, refunded, or recycled?
4. What's the use of the immunity period for new miners?
5. In the metagraph table, which column matters most for your emission?

### Troubleshooting

| Symptom | Quick Fix |
|---|---|
| Burn cost looks unusually high | Wait a few hours: supply & demand |
| UID doesn't appear in metagraph despite success output | Wait 1–2 minutes (sync delay), then re-check |
| `btcli subnet metagraph` is very slow | Normal: metagraph is large. Use `grep` to filter |
| Registered on the wrong netuid | TAO is gone on that netuid: can't be moved. Be careful next time |
| Want to voluntarily deregister | Can't: only auto-deregister when lowest score and a new miner enters |

:::danger DON'T Double-Register on the Same netuid
If you register a second hotkey on netuid 41 with the same coldkey: OK, two slots. But if you re-register the same hotkey without deregistering first → TAO wasted. Check `metagraph` first before re-registering.
:::

---

**Next:** [Obtaining Your UID & Identity Binding →](/TH5-Running-a-Miner/obtaining-uid-and-binding)
