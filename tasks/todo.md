# Restructure docs into 6 Townhalls (Co-Learning Camp #21 India)

Goal: regroup the Day-1..4 curriculum into 6 Townhalls (TH1–TH6) as the Camp #21 guidebook.
Reuse existing content + light edits; concise scaffolds for net-new topics; one page per sub-topic.

## Result

- TH1 Foundations (7) · TH2 Tooling & Ecosystem (6) · TH3 Core Subnets (6) · TH4 Wallets & Miner Setup (6)
  · TH5 Running a Miner (11) · TH6 Graduation & Showcase (6 scaffolds). One-Shot + Resources kept.
- Splits: core-concepts → TH1/06 + TH2/05 + TH2/06; tooling-tokenomics → TH2/01+02+04;
  wallet-setup → TH2/03 (concept) + TH4/03 (hands-on).
- Merges: ridges→TH3/04, connection-and-ports→TH5/03, environment-setup→TH4/06, interaction→TH5/11.
- New scaffolds: TH1/07, TH3/01,05,06, all TH6.
- Overview rewritten (6-TH roadmap, Camp #21). Root + 6 `_category_.json`. Config footer → TH links.
- All inter-doc links converted to **absolute URLs** (survive future moves). Prose Day/Phase/GP/Unit refs cleared.
- Project `CLAUDE.md` updated to the TH structure.

## Verification

- `bun run build` → exit 0, **zero broken links** (`onBrokenLinks: throw`), no markdown-link warnings.
- `grep` for `Day N / Phase N / GP-N / Unit N` in docs → NONE (excl. historical year refs).
- 42 TH pages confirmed: correct titles + sidebar_position.
- Pre-existing (NOT from this work): `bun run typecheck` fails on `src/pages/index.tsx` `JSX.Element`
  (React 19 types) — file untouched, fails identically on HEAD.

---

# (prior) Restructure docs into 4-day curriculum — superseded by the Townhall restructure above
