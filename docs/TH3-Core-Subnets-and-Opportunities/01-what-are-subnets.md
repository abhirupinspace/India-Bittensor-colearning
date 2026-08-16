---
title: 'What Are Subnets?'
description: 'A subnet is a specialized, incentivized market on Bittensor identified by a NetUID. Each has an owner, miners who produce work, and validators who score it. An orientation to the subnet model before the SN13, Chutes, and Ridges deep-dives.'
sidebar_position: 1
---

# What Are Subnets?

A **subnet** is a specialized, incentivized market running on Bittensor. Each subnet is identified by a unique **NetUID** (a number, e.g. `13`, `41`) and exists to produce one specific kind of digital commodity: data, predictions, inference, code fixes, and more.

If Bittensor is the marketplace, **each subnet is a different shop** with its own product, its own buyers, and its own rules for what counts as "good work."

## Who's in a Subnet?

Every subnet has the same three roles:

- **Owner**: defines the subnet's task and the rules for scoring work. They set the incentive mechanism that decides who earns rewards.
- **Miners**: the workers. They **produce** the subnet's output, whether that's scraped data, a sports prediction, an LLM response, or a code patch.
- **Validators**: the judges. They **score** miner work according to the subnet's rules. Their scores flow into Yuma Consensus, which distributes TAO emissions to the best contributors.

For a refresher on how these roles interact mechanically, see the **Miners, Validators & Subnets** session in TH1.

## Subnets Specialize

Each subnet picks a niche and competes to be the best decentralized market for it:

- **Data** — gathering fresh training data (e.g. SN13 / Data Universe)
- **Prediction** — forecasting real-world outcomes (e.g. SN41 / Almanac)
- **Inference** — serving LLM responses on demand (e.g. Chutes)
- **Code intelligence** — solving engineering tasks (e.g. Ridges)

The next pages dive into each of these. Start with **[SN13: Data Universe](/TH3-Core-Subnets-and-Opportunities/sn13-data-universe)**: the subnet you'll build a miner for hands-on in TH4 and TH5.
