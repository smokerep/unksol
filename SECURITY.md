# Security Policy

unk is privacy software: security reports are taken seriously and handled with
priority.

## Reporting a vulnerability

Please report vulnerabilities **privately** via GitHub's private vulnerability
reporting on this repository (Security tab → "Report a vulnerability"). Do not
open public issues for security problems.

You can expect an acknowledgement within 72 hours. Please include reproduction
steps and, where relevant, the affected component (`api/`, `web/`, `browser/`,
`infra/`).

## Scope

- `api/` — auth (SIWS), token gate, WireGuard provisioning, region agents
- `web/` — wallet sign-in flow and session handling
- `browser/` — Electron app: proxy routing, tracker blocking, tab isolation
- `infra/` — node provisioning scripts and the on-node agent

## Known beta limitations (already tracked)

- Shared proxy credentials in the desktop browser beta (per-holder credentials
  are planned before public launch).
- The browser tracker blocklist is a static prototype list.
- Beta builds of the desktop browser are unsigned/not notarized yet.

These are acknowledged trade-offs of the open beta, not undisclosed issues.
