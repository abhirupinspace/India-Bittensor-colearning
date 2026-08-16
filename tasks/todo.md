# Update guidebook to Bittensor v11 + retire SN41 (Aug 2026)

Trigger: audit vs https://www.bittensor.com/docs. Whole upstream stack moved July 2026.

## Verified facts (ground truth, not docs prose)

- `bittensor` **11.1.0** on PyPI 2026-08-13, `requires_python >=3.10,<3.15`. Single pkg = SDK + btcli + wallet.
- `opentensor/bittensor` **archived** 2026-07-10 → `RaoFoundation/subtensor` (`sdk/python`).
- `bittensor-cli` / `latent-to/btcli` **archived** 2026-07-12.
- `opentensor/bittensor-subnet-template` **archived** 2026-07-10. README: "targets the legacy
  Bittensor SDK (v10) and its Axon/Dendrite/Synapse networking stack, which was removed in
  Bittensor 11. It will not work with current releases."
- `sportstensor/sn41` **archived** 2026-07-20, pins `bittensor==10.3.0`.
  `taoshidev/sportstensor` + `sportstensor/sportstensor` → **404**.
  `almanac.sportstensor.com` → **NXDOMAIN**. SN41 mechanism replaced: miners now trade
  Polymarket CLOB via beta.almanac.market; validators pull trading history. Not what we teach.
- `macrocosm-os/data-universe` **active** (2026-08-05), pins `bittensor==10.3.0`. SN13 still
  X/Reddit/YouTube + S3. This is the only runnable track.
- btcli v11 CLI tree captured from a real 11.1.0 install (scratchpad venv), not from prose.
  Notable: `subnets burn-cost <netuid>` (positional), `subnets metagraph <netuid>` (positional),
  `wallet new-hotkey` (hyphens), `-w/-H/-n`, `--amount-tao`, `--json`, `--dry-run`,
  `--mev-shield` default-on, config → `~/.bittensor/btcli.json`.
- Testnet faucet: `faucet.bittensor.com` 404, no `btcli faucet` cmd. Test TAO = Discord request.

## Decisions (user, this session)

1. **Cut SN41** — delete TH3/03 + TH5/02,04,05,06. TH5 becomes SN13-only.
2. **Two explicit venvs** — v11 for btcli/wallet/registration; `bittensor==10.3.0` for SN13 miner code.

## Plan

- [ ] P1 Delete 5 SN41 pages; renumber TH3 (04-06 → 03-05) and TH5 (03,07-11 → 02-07).
      Filename prefix ≠ URL, so renumbering is link-safe; only deletions break links.
- [ ] P2 Repair every inbound link to deleted pages (12 sites found).
- [ ] P3 Install chapters → two-venv v11 (TH4/02, TH4/06, One-Shot, Resources).
      Kill the `bittensor<10.0.0` :::danger block.
- [ ] P4 All btcli examples → v11 syntax (TH2/02,04,05, TH4/06, TH5/01, One-Shot).
- [ ] P5 Python samples → v11 or clearly marked legacy (TH2/05, TH5 s3-storage, TH5 debugging).
      `bt.Synapse`/`bt.axon`/`bt.logging`/`bt.config` are gone; note `bt.http_auth` replacement.
- [ ] P6 Fix 12 dead links; faucet → Discord flow.
- [ ] P7 Housekeeping from repo inspection: sidebar_position collisions (One-Shot 5→7,
      Resources 6→8), dead root `_category_.json`, stale README (Phase 0-3 → TH1-TH6, yarn → bun),
      `JSX.Element` typecheck failure.
- [ ] P8 Update overview roadmap, _category_.json descriptions, CLAUDE.md, footer.
- [ ] P9 Verify: `bun install && bun run build` (onBrokenLinks: throw) + `bun run typecheck`.

## Review

All 9 phases done. 48 files changed, +872 / −2632.

- **P1/P2** 5 SN41 pages deleted (TH3/03, TH5/02,04,05,06); TH3 → 5 pages, TH5 → 7 pages.
  Renumbered via `git mv` (prefix ≠ URL, so link-safe). All 12 inbound links repaired.
- **P3** Install chapters rewritten for two venvs. Killed the `bittensor<10.0.0` :::danger block.
  TH4/06 was still running `pip install bittensor bittensor-cli` and `btcli wallet faucet` —
  both now wrong/nonexistent; fixed.
- **P4** ~90 btcli lines migrated by a context-aware script that skips `neurons/miner.py` lines,
  then positional-netuid + amount-unit fixes by hand. Syntax taken from a real 11.1.0 install.
- **P5** TH2/05 metagraph example → v11. TH5 miner-code samples deliberately LEFT on SDK 10.3.0
  with banners explaining why + the v11 replacement (`bt.http_auth`).
- **P6** 12 dead links fixed. Faucet flow rewritten (no web faucet exists any more → Discord).
- **P7** sidebar collisions (One-Shot 5→7, Resources 6→8); README rewritten; `JSX.Element` →
  `ReactNode` so typecheck passes for the first time.
- **P8** Overview, 3 `_category_.json`, footer, CLAUDE.md (added a "Versioning reality" section
  so this doesn't silently regress).

### Verification

- `bun run build` → **exit 0, zero broken links** (`onBrokenLinks: 'throw'`). Built page tree
  confirms 5 TH3 + 7 TH5 pages, no SN41 routes.
- `bun run typecheck` → **exit 0** (was failing on HEAD).
- External link check re-run: **57/57 real URLs 200**. Remaining non-200s are intentional
  placeholders (localhost, example R2 buckets, discord webhook stub) and `test.finney…` 405,
  which is correct for a WebSocket endpoint.
- btcli syntax verified against `bittensor==11.1.0` installed in a scratchpad venv (`--help`
  output), **not** from docs prose. Live chain reads were not possible — sandbox TLS blocks
  the endpoints — so command *behaviour* on-chain is unverified; syntax is not.

### Deliberately left alone

- SN41 still appears as an **illustrative** subnet in TH1/TH2 diagrams, the dTAO AMM math
  example, and the glossary. It's still a live subnet — only the hands-on track was removed.
- Miner-script flags stay `--wallet.name` style. That is correct for SDK 10.3.0.

### Open / worth watching

- `data-universe` pins `bittensor==10.3.0`. When it migrates to v11, TH5 and the second venv
  collapse into one — revisit then.
- TH6 pages are still thin scaffolds (23–32 lines); untouched by this pass.
- Docusaurus 3.7 → 3.10.2 upgrade available; not taken (out of scope).
