# Security policy

## How this project is meant to be safe

- **Production is a static site.** `npm run build` exports plain HTML, CSS and JS to `out/`. There is no server, API, database or login, so the live site has nothing that accepts a write. Its content changes only when a new build from the repository is deployed.
- **The content dashboard is development-only by design.** It exists only under `npm run dev`, listens on 127.0.0.1, and rejects requests that aren't same-origin, from localhost, and marked with its custom header. The build fails if any dashboard code, API path or source map reaches `out/` (`scripts/verify-build.mjs`).
- **A strict Content-Security-Policy.** Every page allows only its own hashed scripts, plus the security headers listed in `scripts/security-headers.mjs`.

The full audit, with the evidence for each check, is in [`docs/improvements/15-security-audit.md`](docs/improvements/15-security-audit.md).

## Reporting a vulnerability

Please report it privately through GitHub: the repository's **Security** tab → **Report a vulnerability**. Don't open a public issue. Include the steps to reproduce it and the affected version or commit. You should get a reply within 7 days.

In scope:
- anything that lets someone other than the repository owner change what the deployed site shows;
- script injection or a CSP bypass on the deployed site;
- the dashboard being reachable from another origin or another machine while `npm run dev` runs;
- secrets or personal data exposed by the build.

Out of scope: problems that need the attacker to already control your machine or your GitHub, hosting or DNS accounts, and missing headers on hosts that can't set them (GitHub Pages).

## If you fork this project

Your fork is your own site. To keep it as locked down as this one, follow the checklist in the audit's **Repository and deployment** section: branch protection, two-factor authentication, deploys only from `main`, and a registrar lock on your domain.
