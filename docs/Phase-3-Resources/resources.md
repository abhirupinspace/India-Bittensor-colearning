---
sidebar_position: 1
title: '📚 More Bittensor Resources'
description: 'A curated collection of official Bittensor references: documentation, explorers, subnet repos, YouTube channels, testnet faucet, community channels, and a glossary of essential terms for continued exploration after CLC9.'
---

# 📚 More Bittensor Resources

:::info How to Use This Page
This page is your **lifelong reference** as a Bittensor miner/builder. Bookmark relevant links, continue self-directed exploration, and use the glossary below as a dictionary when reading technical documents / forums.

Categories are arranged from "most fundamental" (official docs) to "community & tools". If you've just finished CLC9, start with **Learning Resources** → **Subnet Repos** to decide your next specialization.
:::

---

## 📖 Official Documentation

The canonical sources: the absolute source of truth for Bittensor architecture & APIs.

| Resource | URL | Description |
|----------|-----|-------------|
| 📘 **Bittensor Docs** | [docs.bittensor.com](https://docs.bittensor.com) | Official documentation: install, btcli, Python SDK, Yuma Consensus, subnet creation |
| 📄 **Whitepaper v2** | [bittensor.com/whitepaper](https://bittensor.com/whitepaper) | Academic paper: incentive mechanism, Yuma consensus math, TAO tokenomics |
| 🏗️ **Bittensor Python SDK** | [github.com/opentensor/bittensor](https://github.com/opentensor/bittensor) | SDK source code: useful when debugging SDK errors |
| ⚙️ **Subtensor Chain** | [github.com/opentensor/subtensor](https://github.com/opentensor/subtensor) | Blockchain layer source (Substrate-based) |

---

## 📊 Explorers & Analytics

For monitoring subnets, miners, validators, and tokenomics in real time.

| Resource | URL | Description |
|----------|-----|-------------|
| 📈 **Taostats** ⭐ | [taostats.io](https://taostats.io) | Explorer #1: subnet leaderboards, validator rankings, price chart, metagraph per netuid |
| 💰 **TaoMarketCap** | [taomarketcap.com](https://taomarketcap.com) | TAO + subnet token price tracker (after dynamic TAO launch) |
| 🔎 **Polkadot.js Apps** | [polkadot.js.org/apps](https://polkadot.js.org/apps/?rpc=wss://entrypoint-finney.opentensor.ai) | Raw chain explorer: inspect blocks, extrinsics, storage |
| 📊 **Subnet Dashboard** | [bittensor.com/scan](https://bittensor.com/scan) | Official subnet overview from OTF |
| 🏆 **Data Universe Dashboard** | [data-universe.macrocosmos.ai](https://data-universe.macrocosmos.ai) | SN13-specific miner leaderboard & freshness stats |
| ⚽ **Sportstensor Dashboard** | [sportstensor.com](https://sportstensor.com) | SN41-specific: miner accuracy leaderboard |

---

## 🌐 Official Site & Social

Official channels for governance updates, new subnet launches, and announcements.

| Channel | URL | Notes |
|---------|-----|-------|
| 🌍 **bittensor.com** | [bittensor.com](https://bittensor.com) | Main landing page |
| 🏛️ **Open Tensor Foundation** | [opentensorfoundation.org](https://opentensorfoundation.org) | OTF: the non-profit organization behind Bittensor |
| 🐦 **@bittensor (Twitter/X)** | [@bittensor](https://x.com/bittensor) | Official updates, partnerships, milestones |
| 🐦 **@MacrocosmosAI** | [@MacrocosmosAI](https://x.com/MacrocosmosAI) | The team behind SN13 Data Universe |
| 💬 **Bittensor Discord** | [discord.gg/bittensor](https://discord.gg/bittensor) | Global community: #general, per-subnet channels, #dev-help |
| 📣 **Telegram Announcements** | [t.me/BittensorAnnouncements](https://t.me/BittensorAnnouncements) | Low-volume update channel |
| 📰 **Bittensor Blog** | [bittensor.com/blog](https://bittensor.com/blog) | Technical deep dives + product updates |

---

## 🧬 Subnet Repos (GitHub)

Source code for popular subnets. Fork + study to understand internals & find contribution ideas.

### Phase 2 Curriculum Subnets

| Subnet | Repo | Topic |
|--------|------|-------|
| **Sportstensor (SN41)** | [github.com/taoshidev/sportstensor](https://github.com/taoshidev/sportstensor) | Sports event predictive model |
| **Data Universe (SN13)** ⭐ | [github.com/macrocosm-os/data-universe](https://github.com/macrocosm-os/data-universe) | Decentralized data scraping |

### Other Major Subnets

| Subnet | Repo | Topic |
|--------|------|-------|
| **Chutes (SN64)** | [github.com/rayonlabs/chutes-api](https://github.com/rayonlabs/chutes-api) | Decentralized inference infrastructure |
| **Ridges (SN62)** | [github.com/ridgesai/ridges](https://github.com/ridgesai/ridges) | Code intelligence & engineering agent |
| **Targon (SN4)** | [github.com/manifold-inc/targon](https://github.com/manifold-inc/targon) | LLM inference subnet |
| **Omron (SN2)** | [github.com/inference-labs-inc/omron-subnet](https://github.com/inference-labs-inc/omron-subnet) | zkML verifiable inference |
| **Cortex.t (SN18)** | [github.com/corcel-api/cortex.t](https://github.com/corcel-api/cortex.t) | Text generation API |

:::tip How to Read a Subnet Repo
1. `README.md`: overview first
2. `neurons/miner.py` and `neurons/validator.py`: code entry points
3. `protocol.py`: synapse schema (chain ↔ miner ↔ validator interactions)
4. `scoring/` or `rewards/`: incentive mechanism
:::

---

## 🎥 Learning Resources

Videos, blogs, and podcasts to learn Bittensor more deeply.

### YouTube Channels

| Channel | URL | Content |
|---------|-----|---------|
| 🎓 **Bittensor Guru** | [youtube.com/@BittensorGuru](https://www.youtube.com/@BittensorGuru) | Beginner-to-advanced tutorials, subnet reviews |
| 🧪 **Open Tensor Foundation** | [youtube.com/@opentensor](https://www.youtube.com/@opentensor) | Official channel: keynotes, AMAs, product updates |
| 🌌 **Macrocosmos AI** | [youtube.com/@MacrocosmosAI](https://www.youtube.com/@MacrocosmosAI) | Deep dives on SN13 + their subnet family |
| 🎙️ **Tensor Tuesdays** (podcast) | search Spotify | Weekly podcast with subnet operators |

### Blogs & Long-Form Reads

| Resource | URL | Notes |
|----------|-----|-------|
| 📝 **Corcel Blog** | [corcel.io/blog](https://corcel.io/blog) | Technical deep dives: LLM subnets, inference |
| 📝 **Taostats Blog** | [taostats.io/blog](https://taostats.io/blog) | Analytics-heavy: emission trends, validator economics |
| 📝 **OTF Newsroom** | [bittensor.com/blog](https://bittensor.com/blog) | Official announcements |
| 📝 **Messari Bittensor Report** | search "Messari Bittensor" on Google | Institutional-grade research |

---

## 🧪 Testnet & Dev Tools

Before deploying to mainnet, **always test on testnet** (no real TAO).

| Tool | URL / Command | Function |
|------|---------------|----------|
| 💧 **Testnet Faucet** | [faucet.bittensor.com](https://faucet.bittensor.com) | Free test TAO for devs |
| 🌐 **Testnet Endpoint** | `wss://test.finney.opentensor.ai:443` | Subtensor testnet chain |
| 🔧 **Btcli** | `pip install bittensor` → `btcli --help` | CLI wallet, subnet, stake management |
| 🐳 **Subtensor Docker** | [hub.docker.com/u/opentensorfdn](https://hub.docker.com/u/opentensorfdn) | Run a local subtensor node |
| 🔨 **Bittensor Wallet GUI** | [chrome web store search: bittensor wallet](https://chromewebstore.google.com/) | Browser extension wallet (still beta) |
| 📦 **Mock Subtensor** | [github.com/opentensor/bittensor/blob/master/bittensor/mock/subtensor_mock.py](https://github.com/opentensor/bittensor/) | Mock chain for unit testing |

:::tip Testnet Workflow
Deploying your own subnet? Follow: **Testnet (netuid 99, 100, etc.) → Mainnet registration**. The testnet faucet gives 1 TAO/day/wallet. Enough for several register cycles.
:::

---

## 🌏 Community

You're not alone! The global Web3 & Bittensor community is active and welcoming.

| Community | Channel | Focus |
|-----------|---------|-------|
| 🎓 **HackQuest** | [@HackQuest_](https://x.com/HackQuest_) | Web3 learn-to-earn platform, Co-Learning Camp series |
| 🐦 **Quack Believers** | Invite-only (camp graduates) | Alumni network: advanced discussion, job referrals, grants |
| 💬 **Bittensor Local Groups** | Search Telegram for "Bittensor [region]" | Regional discussions on mining & subnets |

:::tip Join Quack Believers!
After graduating CLC9, you'll get an invite to **Quack Believers**: alumni-only community. There you'll find:
- 🛠️ Dedicated help channel for miner issues
- 💼 Job & grant board (Bittensor ecosystem hiring)
- 🎟️ Priority access to future CLCs
- 🤝 Co-founder matching for building new subnets

**TH1–TH4 attendance + complete submission = the key to graduating.**
:::

---

## 📖 Glossary: Essential Terms

Keep this as a dictionary when reading Bittensor docs or forums.

### Core Concepts

**Bittensor**
: A decentralized AI protocol that combines crypto incentives with a compute/intelligence marketplace. Native token: **TAO**.

**TAO (τ)**
: The Bittensor native token. Supply cap of 21M (similar to Bitcoin). Emitted to miners & validators based on their contribution.

**Subnet**
: An individual "market" for a specific AI task (inference, data scraping, prediction, etc.). Each has a **NetUID**.

**NetUID**
: The numeric subnet ID (SN13 = Data Universe, SN41 = Sportstensor, SN1 = Text Prompting, etc.).

**Tempo**
: A time interval (~72 minutes, ~360 blocks) at which validators set weights and emissions are distributed.

**Epoch**
: A longer scoring period, typically ~24 hours for scoring aggregation.

### Wallet & Keys

**Coldkey**
: The main key: full control over TAO stake and account authority. **Store offline / on a hardware wallet**, NEVER on a VPS.

**Hotkey**
: A derived operational key: can "sign" miner/validator transactions but CANNOT transfer TAO. Safe to keep on a VPS.

**SS58 Address**
: Substrate/Polkadot blockchain address format (e.g., `5FHneW46...`). Similar to Ethereum address but in a different format.

**Mnemonic**
: A 12- or 24-word seed phrase to recover the wallet. Treat these words as your bank PIN: **DO NOT share.**

### Economics

**Stake**
: The amount of TAO delegated to a hotkey (validator or miner) to participate in a subnet. More stake = more influence.

**Emission**
: TAO that gets minted and distributed to miners/validators each tempo based on performance.

**Incentive**
: A normalized score (0–1) that validators assign to each miner. Determinant of emission.

**Dividend**
: Reward for validators (from delegators' stake).

**Weights**
: An array of values that validators set on-chain to determine the best miners. Sum of weights = 1.

**Yuma Consensus**
: Bittensor's consensus algorithm for aggregating validator weights → robust incentive scoring vs dishonest validators.

**Recycled TAO**
: TAO that's "burned" when miners register on a subnet: anti-sybil function.

**Burn**
: Permanently destroying TAO; part of the deflationary mechanism.

### Node Roles

**Miner (Server)**
: A neuron that contributes work (compute, data, prediction) and is rated by validators.

**Validator**
: A neuron that evaluates miner work quality and sets weights on-chain.

**Subnet Owner**
: The creator of the subnet: gets a cut of emission as an incentive to run the subnet.

**Delegator (Nominator)**
: A TAO holder who stakes to a validator to share dividends without running their own node.

**Axon**
: HTTP/RPC endpoint of the miner: interface where validators send queries & retrieve responses.

**Dendrite**
: Validator-side client: library that sends synapse requests to axons.

**Synapse**
: Request/response data schema between validator ↔ miner (a pydantic model in the bittensor framework).

**Metagraph**
: Subnet state snapshot at a given tempo: list of UIDs, hotkey, stake, weights, incentive, etc.

**UID**
: A unique slot ID in a subnet (0 to `max_uids - 1`). Each miner occupies 1 slot.

**Immunity Period**
: A grace period after registration (~5000 blocks) during which a new miner cannot be deregistered even with low scoring.

**Deregistration**
: The process of kicking the miner with the lowest score when a new miner registers with a higher TAO recycle.

### Technical Stack

**Substrate**
: A Rust blockchain framework (from Parity) underlying Subtensor.

**Finney**
: The codename for the Bittensor mainnet (named after Hal Finney, a Bitcoin pioneer).

**Subtensor**
: The Bittensor chain client name.

**btcli**
: The Bittensor command-line interface: `pip install bittensor` includes btcli.

**PM2**
: A popular Node.js process manager for keeping miners auto-restarting.

**Axon Port**
: TCP port the miner is listening on (default 8091). Must be public-reachable.

### SN13-Specific

**Label**
: A content category (subreddit, hashtag, YouTube channel).

**Data Entity**
: A single unit of data (one post/tweet/transcript segment).

**Freshness**
: A scoring dimension: how recent is the scraped data.

**Coverage**
: A scoring dimension: diversity of the miner's data sources.

**S3-Compatible Storage**
: Cloud storage that implements the S3 API: AWS S3, Cloudflare R2, Backblaze B2, Wasabi.

---

## 🔥 Bonus: Advanced Reading List

If you want to become a subnet owner or expert validator, start reading:

1. **Paper**: ["Yuma Consensus: Decentralized Machine Intelligence"](https://bittensor.com/whitepaper)
2. **Thesis**: Look for "Decentralized Mixture of Experts" papers: Bittensor's core philosophy
3. **Book**: "Crypto and AI": framing tokenomics × machine learning
4. **Code**: `bittensor/core/extrinsics/` in the SDK: how to make custom chain extrinsics

---

## 🎓 Congratulations!

:::tip You've Completed the CLC9 Bittensor Curriculum 🎉
From not knowing what Web3 or AI is, to running production miners on two different subnets (SN41 Sportstensor & SN13 Data Universe): that's a **huge achievement.** Be proud of yourself!

**Next steps:**

1. 🎯 **Submit all evidence** on the HackQuest Learning Track before TH4
2. 🏆 **Attend Graduation Day (TH4)** to receive the NFT Certificate
3. 🦆 **Receive a Quack Believers invitation**: alumni network for graduates
4. 🚀 **Pick a specialization**:
   - Want to become a **subnet owner**? Learn Substrate + Rust
   - Want to become a **validator**? Accumulate TAO & build a reputation for uptime
   - Want to **contribute open source**? Look for good-first-issues in your favorite subnet repo
   - Want to **start a startup**? Join the OTF grant program: funding up to $250k for Bittensor ecosystem projects
5. 🌏 **Stay active in the HackQuest community**. Bring friends to the next batch!

> *In Builders We Trust. In Decentralized AI We Thrive. 🤝⚡*

See you on Graduation Day: and in the next CLC batch!
:::

---

*This page is a living document. If you find a dead link, a new resource, or a missing term, open an issue/PR on the docs repo. Your contribution makes the curriculum better for the next batch.*

**The Bittensor Co-Learning Camp India Team (HackQuest × Bittensor) 🦆**
