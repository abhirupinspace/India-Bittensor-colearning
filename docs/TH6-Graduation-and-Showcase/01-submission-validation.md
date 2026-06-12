---
title: 'Submission Validation'
sidebar_position: 1
description: 'What you submit to graduate from the HackQuest × Bittensor Co-Learning Camp #21 India, and how submissions are validated.'
---

# Submission Validation

To graduate from the **HackQuest × Bittensor Co-Learning Camp #21 India**, you submit proof that you registered and ran a real miner. The bar is intentionally simple: a running miner plus evidence.

:::tip Minimum Proof
The **One-Shot Guide** lists the minimum proof set. If you only do one thing, follow that checklist end to end.
:::

## What to Submit

- **Registered hotkey** — your hotkey SS58 address
- **NetUID + UID** — which subnet (e.g. SN41 = 41, SN13 = 13) and the UID assigned to you
- **Running-miner evidence** — a screenshot or log snippet showing your miner online (e.g. `pm2 status`, validator query → response, or upload cycle)
- **Short write-up** — 1 page: what you built, which subnet, first results, what you learned

## Validation Criteria

- **On-chain match** — your UID + hotkey appear in `btcli subnet metagraph --netuid <N>`
- **Liveness** — logs show validator interaction (queries answered, or data uploaded + audited)
- **Authenticity** — evidence is your own wallet, not a screenshot of someone else's

## How to Submit

1. Collect the items above into one folder or doc
2. Post in the designated HackQuest submission channel
3. Tag the organizers per the Townhall instructions
