# Restructure docs into 4-day curriculum

Goal: collapse Phase-0..3 into Day-1..4 + Resources. Dev/student-focused. Keep content nearly verbatim.

## Mapping (file moves via `git mv`, keep base slugs, renumber prefixes)

### Day-1-Foundations/ (theory)
- [x] 01-what-is-web3.md ← Phase-0/01
- [x] 02-what-is-ai.md ← Phase-0/02
- [x] 03-centralized-vs-decentralized-ai.md ← Phase-0/03
- [x] 04-why-bittensor.md ← Phase-0/04
- [x] 05-rise-of-ai-bittensor.md ← Phase-1/Concept-1/01
- [x] 06-core-concepts.md ← Phase-1/Concept-1/02
- [x] 07-tooling-tokenomics.md ← Phase-1/Concept-1/03

### Day-2-Tooling-and-Ecosystem/
- [x] 01-intro-and-hardware-check.md ← Phase-2/GP-0/01
- [x] 02-installing-btcli.md ← Phase-2/GP-0/02
- [x] 03-wallet-setup.md ← Phase-2/GP-0/03
- [x] 04-chutes.md ← Phase-1/Concept-2/01
- [x] 05-data-universe.md ← Phase-1/Concept-2/02
- [x] 06-sportstensor.md ← Phase-1/Concept-2/03
- [x] 07-ridges.md ← Phase-1/Concept-2/04

### Day-3-Testnet-and-Registration/
- [x] 01-register-subnet-testnet.md ← GP-0/04
- [x] 02-run-local-miner.md ← GP-0/05
- [x] 03-connection-and-ports.md ← GP-0/06
- [x] 04-intro-sn41.md ← GP-1/01
- [x] 05-wallet-tao-funding.md ← GP-1/02
- [x] 06-register-miner.md ← GP-1/03
- [x] 07-almanac-registration.md ← GP-1/04
- [x] 08-intro-sn13.md ← GP-2/01
- [x] 09-environment-setup.md ← GP-2/02

### Day-4-Mining-and-Optimization/
- [x] 01-local-debugging.md ← GP-0/07
- [x] 02-miner-init-metadata.md ← GP-1/05
- [x] 03-programmatic-trade-execution.md ← GP-1/06
- [x] 04-trading-strategies.md ← GP-1/07
- [x] 05-miner-config-scraping.md ← GP-2/03
- [x] 06-scoring-optimization.md ← GP-2/04
- [x] 07-s3-storage-upload.md ← GP-2/05
- [x] 08-interaction.md ← GP-2/06

### Resources/
- [x] resources.md ← Phase-3/resources

## Steps
- [x] Create new folders + git mv files w/ renumbered prefixes
- [x] Write _category_.json for each new folder; remove old phase folders
- [x] Normalize same-folder `./0X-name` links → `./name` (prefix-agnostic)
- [x] Fix cross-day links explicitly
- [x] Strip sidebar_position from frontmatter (filename prefix is single source of truth)
- [x] Rewrite 00-overview.md → dev/student tone, Day 1-4 labels, drop SOP/KPI lang
- [x] Update docusaurus.config.ts footer links
- [x] Set explicit `slug: /resources` on resources.md to dodge folder/file URL collision
- [x] `bun run build` — passed with onBrokenLinks: throw

## Review
- 4-day structure live: Day-1-Foundations (7), Day-2-Tooling-and-Ecosystem (7), Day-3-Testnet-and-Registration (9), Day-4-Mining-and-Optimization (8), Resources (1).
- All file content kept verbatim except 00-overview.md (rewritten) and a few "Next" link labels.
- Stale "Phase X / GP-Y / Unit Z" mentions remain in body prose of some docs (informational, not broken links). Can be cleaned in a follow-up if desired — listed below.

## Follow-up cleanup candidates (prose-only, not broken)
- Day-1/01-what-is-web3.md:126 — "Phase 2 → GP-0 Unit 3 (Wallet Setup)"
- Day-1/04-why-bittensor.md:180 — "GP-0:" line
- Day-2/01-intro-and-hardware-check.md — "GP-0 Roadmap" header + several mentions
- Day-2/05-data-universe.md, 06-sportstensor.md, 07-ridges.md — multiple "Phase 2 GP-X" mentions
- Day-3/08-intro-sn13.md — "Phase 2 GP-1", "GP-2 6-Unit Roadmap"
- Day-3/03-connection-and-ports.md — "testnet GP-0"
- Day-3/09-environment-setup.md — "from GP-1"
- Day-4/01-local-debugging.md — "GP-0 Done!" header, "GP-0/1/2" link labels

## Cross-day link fix list
1. Day-1/tooling-tokenomics.md → `../Day-2-Tooling-and-Ecosystem/chutes`
2. Day-2/wallet-setup.md → `../Day-3-.../register-subnet-testnet`
3. Day-2/ridges.md → `../Day-3-.../intro-sn41`
4. Day-3/register-subnet-testnet.md → `../Day-2-.../wallet-setup`
5. Day-3/connection-and-ports.md → `../Day-4-.../local-debugging`
6. Day-3/almanac-registration.md → `../Day-4-.../miner-init-metadata`
7. Day-3/environment-setup.md → `../Day-4-.../miner-config-scraping`
8. Day-4/local-debugging.md (2 links) → `../Day-3-.../intro-sn41`, `intro-sn13`
9. Day-4/miner-init-metadata.md → `../Day-3-.../almanac-registration`
10. Day-4/trading-strategies.md → repoint to `./miner-config-scraping`
11. Day-4/miner-config-scraping.md → `../Day-3-.../environment-setup`
12. Day-4/interaction.md → `../Resources/resources`
13. 00-overview.md body links → `./Day-1-Foundations/what-is-web3` etc.
