# unk — launch checklist (Solana v2)

The full rebuild of the privacy layer on Solana. Rules learned the hard way are
baked in: **the brain must be unkillable, every node must be disposable, every
secret must be recoverable.**

## Architecture v2 (fixes the old failure modes)
- **API + DB on a managed platform** (Railway / Fly / Render): deploys from this
  repo, managed Postgres with automatic backups. A missed VPS invoice can no
  longer kill the product (the old brain died twice this way).
- **VPN nodes are disposable VPS** (one prepaid provider, e.g. Vultr, autopay ON):
  `infra/deploy/node.sh` stands one up in ~5 min (WireGuard + tinyproxy + agent).
  All nodes are `control.kind: "agent"` — the API is pure HTTP and needs no
  WireGuard on its own box.
- **Secrets are recoverable**: keep `REGIONS_JSON` + agent secrets + JWT secret
  in an encrypted backup (e.g. `age`) committed alongside the repo or stored in
  the platform's secret manager — never only on one server.

## 1. Deploy the API
Railway/Fly: create the service from `api/` (Node 20, `npm start` runs tsx),
attach Postgres, set env: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`,
`SOLANA_RPC_URL` (Helius free tier), `TOKEN_MINT` (empty until launch),
`MIN_TOKEN_BALANCE`, `DEV_BYPASS_TOKEN_GATE=true` (beta), `SEARXNG_URL`,
`REGIONS_JSON` (as nodes come up), `DOWNLOAD_*` (when the browser ships).
Run `npx prisma migrate deploy` on first boot.

## 2. Domain (buy it FIRST this time)
Buy the definitive domain, then: site on Netlify (this repo, base=web),
`api.<domain>` → the managed API (platform custom domain), `search.<domain>` →
the search VPS. Set Netlify env `NEXT_PUBLIC_API_URL=https://api.<domain>` +
`NEXT_PUBLIC_SOLANA_RPC` → clear-cache redeploy. Add every origin to
`CORS_ORIGIN`. (Env vars are baked at build → any change needs a clear-cache
redeploy. CORS misses = "Failed to fetch".)

## 3. Nodes (Vultr, prepaid, autopay)
Per country: deploy Ubuntu 24.04 → `node.sh` (prints the REGIONS_JSON entry)
→ `proxy.sh` → append entry to `REGIONS_JSON` on the API → restart. Browser
picks new countries automatically via `GET /vpn/nodes`. SearXNG: one VPS with
`searxng.sh` (or a container on the platform).

## 4. Launch $UNK (pump.fun — name "unk", ticker "unk")
- API env: `TOKEN_MINT=<mint>`, `MIN_TOKEN_BALANCE=100000` (decided: 100k $UNK),
  `DEV_BYPASS_TOKEN_GATE=false` → restart. The gate is live.
- `web/components/Socials.tsx` → `CONTRACT='<mint>'` (CA button + Dexscreener).
- Swap: build the Jupiter-backed widget (`web/lib/swap.ts` has the plan:
  quote API → swapTransaction → wallet signs) → `SWAP_LIVE=true`.
- `browser/src/swap/config.js` → same mint, when the browser swap ships.

## 5. Browser release
- Endpoints in `browser/src/main.js` (`API_BASE`, per-node creds) +
  `renderer.js`/`newtab.html` (SEARCH) point at `*.unk-tool.tech` placeholders —
  set the real domain, bump version, build installers.
- Re-enable CI: move `infra/ci/build-browser.yml` to `.github/workflows/`
  (needs `gh auth refresh -h github.com -s workflow` once) — installers built
  by GitHub Actions with SHA-256 + provenance attestations ("don't trust,
  verify" page on /download).
- Per-holder proxy credentials before public marketing (shared beta creds are
  an abuse risk).

## 6. X / socials
Rebrand the X handle (or new one) → `TWITTER` in `web/components/Socials.tsx`
(+ the link in `browser/src/ui/newtab.html`).

## Current state of this repo
- Full Solana port: SIWS auth (`api/src/siws.ts`), SPL gate (`api/src/solana.ts`),
  wallet-adapter frontend (Phantom/Solflare), base58 crypto shortcuts in search.
- Brand: unk / $UNK, Solana palette (#9945FF → #14F195), hooded logo, pack
  backgrounds hue-shifted via CSS.
- Pre-launch: CA "soon", `/swap` placeholder (Jupiter at launch), downloads
  gated, `DEFAULT_REGIONS` empty until the new fleet exists.
- Multi-region engine, agent, deploy scripts: unchanged from the proven fleet
  (10 countries / 4 continents at peak).
