# Bittensor Co-Learning Camp

Curriculum for the **HackQuest Co-Learning Camp #23 India** (offline), a HackQuest × Bittensor program that takes students from zero (no Web3, no AI background) to running a production miner on **Data Universe (SN13)**.

This is a [Docusaurus](https://docusaurus.io/) site.

## Local development

`bun.lock` is committed — use bun.

```bash
bun install
bun start          # dev server on :3000
```

Opens http://localhost:3000.

## Build

```bash
bun run build      # static output → build/
bun run serve      # serve the built site
bun run typecheck  # tsc, no emit
bun run clear      # clear .docusaurus cache
```

`onBrokenLinks: 'throw'` — a typo in any internal link fails the build. Run `bun run build` before
claiming a docs change is done; `bun start` does not enforce it.

## Curriculum structure

Six Townhalls (TH1–TH6), plus two standalone pages.

- **TH1 — Foundations & Introduction**: Web3, AI, centralized vs decentralized AI, what Bittensor is, miners/validators/subnets, program structure
- **TH2 — Tooling & Ecosystem**: TAO tokenomics, Dynamic TAO, wallets (coldkey/hotkey), btcli, network structure, incentives
- **TH3 — Core Subnets & Opportunities**: what subnets are, SN13 Data Universe, other notable subnets, use cases, builder opportunities
- **TH4 — Wallets & Miner Setup**: dependencies, Bittensor SDK, creating wallets, registration, miner architecture, getting ready to mine
- **TH5 — Running a Miner**: register, run a local miner, then SN13 end to end (scraping, scoring, S3 storage), plus logs and debugging
- **TH6 — Graduation & Showcase**: submission, showcases, recognition, ecosystem opportunities, graduation
- **One-Shot Guide** (`/one-shot`) and **Resources** (`/resources`)

## Versioning notes

The Bittensor stack changed majors in July 2026, and this guidebook reflects that:

- **Bittensor 11** ships the SDK, the wallet, and `btcli` in **one** package (`pip install bittensor`). The separate `bittensor-cli` and `bittensor-wallet` packages are archived.
- btcli v11 uses `-w` / `-H` / `-n`; the older `--wallet.name` / `--subtensor.network` syntax is gone. Config moved to `~/.bittensor/btcli.json`.
- `Axon` / `Dendrite` / `Synapse`, `bt.config`, and `bt.logging` were **removed** in v11. Signed HTTP (`bt.http_auth`) replaces the networking stack.
- Subnet miner code has **not** all migrated. `macrocosm-os/data-universe` pins `bittensor==10.3.0`, so the curriculum uses **two virtualenvs**: `~/.venvs/bt` (v11, for btcli) and `~/.venvs/sn13` (10.3.0, for miner code). Miner-script examples intentionally keep the legacy `--wallet.name` argparse style.
- **SN41 Sportstensor was retired from the curriculum.** It rebranded to Almanac and replaced its incentive mechanism (miners now trade Polymarket orders rather than serve predictions); its code repo was archived 2026-07-20.
- `opentensor/bittensor-subnet-template` is archived and cannot run on v11. TH5 still uses it as a deliberate teaching rig, clearly labelled as such.

## Brand & attribution

Bittensor, TAO, Subtensor, and Opentensor Foundation marks are property of the **Opentensor Foundation (OTF)**. Used here per Opentensor Graphic Standards. Educational material authored by **HackQuest** as community education. Not officially affiliated with OTF unless stated.
