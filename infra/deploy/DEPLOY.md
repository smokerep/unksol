# Deploy the backend (Contabo / any Ubuntu VPS)

This puts the **whole backend** on one box: API + database + (later) WireGuard VPN + (optional) SearXNG, behind **automatic HTTPS**.

> Example server: Contabo Cloud VPS · Ubuntu 24.04 · `213.199.51.59`

## 1. SSH into the server

```bash
ssh root@213.199.51.59
```

## 2. Run the one-shot setup

```bash
git clone https://github.com/giupy997/anonrh.git /opt/unk
cd /opt/unk
DOMAIN=213.199.51.59.nip.io \
SITE_ORIGIN=https://YOUR-SITE.netlify.app \
bash infra/deploy/setup.sh
```

- **`DOMAIN`** — an HTTPS hostname pointing at your IP. `213.199.51.59.nip.io` is a free wildcard-DNS host that resolves to your IP, so Caddy can get a real certificate **without buying a domain yet**. Switch it to `api.yourdomain.com` later.
- **`SITE_ORIGIN`** — your deployed site URL (used for CORS). Put your real Netlify URL; or `*` to allow any origin while testing.

The script installs Node, Caddy, WireGuard, the backend, runs the DB migration, and starts everything as a systemd service.

Check it:

```bash
curl https://213.199.51.59.nip.io/health      # -> {"ok":true,...}  (wait ~30s for the cert)
```

## 3. Point the site at the backend

In **Netlify → Site settings → Environment variables**:

```
NEXT_PUBLIC_API_URL = https://213.199.51.59.nip.io
```

Then **trigger a redeploy**. Now wallet sign-in, search and download work on the live site.

---

## Day-2 operations

```bash
# Logs
journalctl -u unk-api -f

# Update to the latest code
cd /opt/unk && git pull && cd api && npm install && npx prisma migrate deploy && systemctl restart unk-api

# Restart
systemctl restart unk-api
```

Backend config lives in `/opt/unk/api/.env`.

## What to flip later

- **Token launch** → in `.env` set `TOKEN_ADDRESS=<0x…>` (the $UNK ERC-20 on Solana), `MIN_TOKEN_BALANCE=...`, `DEV_BYPASS_TOKEN_GATE=false`, then `systemctl restart unk-api`. (Until then, everyone counts as eligible — fine for testing.)
- **Real VPN** → follow [`../README.md`](../README.md) to bring up `wg0`, then set `WIREGUARD_PROVIDER=local` in `.env` and restart. The service already runs as root so it can manage WireGuard.
- **Real search (SearXNG)** → see "Search (SearXNG)" in [`../README.md`](../README.md); run it on `127.0.0.1:8080`, then set `SEARXNG_URL=http://localhost:8080`.
- **Browser downloads** → after building installers, set `DOWNLOAD_MAC/WIN/LINUX` to the release URLs.
- **Custom domain** → edit `DOMAIN` in `/etc/caddy/Caddyfile` (and `systemctl reload caddy`), set `CORS_ORIGIN` to your domain in `.env`, update Netlify's `NEXT_PUBLIC_API_URL`, redeploy.

## Notes

- HTTPS needs a hostname (not a bare IP); `*.nip.io` is the zero-cost interim. If nip.io ever misbehaves, `sslip.io` works the same way.
- Open ports: 22 (SSH), 80/443 (web), 51820/udp (WireGuard). The script sets these via `ufw`.
