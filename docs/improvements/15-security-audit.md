# 15 · Security audit (Phase 5)

**Date:** 5 November 2026 · **Scope:** the repository at the Phase 4 commit (`a09dc59`) plus the fixes below · **Method:** code review of every server-side and build file, live attack requests against the dev server and the production export, automated scans (npm audit, gitleaks), and regression tests for each fix.

## Threat model

The production site is a static export with no server, so its content can change only through:

1. **a commit to the repository** that gets deployed;
2. **the hosting account**, which can deploy anything;
3. **the domain's DNS**, which can point the name at another site.

Forks change only the fork. The audit has to show there is **no fourth path**, and harden 1–3.

## Result

| # | Area | Result |
|---|---|---|
| A | Build artifacts | ✅ Pass |
| B | Dev server and dashboard API | ✅ Pass after fix **F-1** |
| C | File handling | ✅ Pass |
| D | Content injection (XSS) | ✅ Pass (hardening **F-2**) |
| E | Headers and CSP | ✅ Pass (verified on the export; recheck on the live host after deploy) |
| F | Supply chain | ✅ Pass after fix **F-3** (`npm audit`: 0 vulnerabilities) |
| G | Secrets | ✅ Pass (one false positive, allow-listed) |
| H | Repository and deployment governance | ⚠️ **Action needed from you** (account settings, below) |
| I | Privacy | ⚠️ **Decision needed from you** (third-party emails) |
| J | Licensing | ✅ Pass |
| K | DAST (ZAP baseline) | ⏳ After the first deploy |

The code-side requirements (A, B, D) all pass. H depends on your GitHub, host and registrar settings, which only you can change. Until those are set, path 1 is only as safe as your GitHub account.

## Findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| F-1 | Low (dev only) | The dashboard API's size limit relied on `Content-Length`. A chunked request has no such header, so a 6 MB JSON body was read in full past the 2 MB limit. Only a same-origin local client with the dashboard header could send it, so the impact was memory use in your own dev server | **Fixed:** `readBodyLimited` / `readJsonLimited` in `src/lib/dashboard/guard.ts` stop reading at the limit; all three routes use them. Retest: 413 |
| F-2 | Informational | A saved theme id such as `__proto__` or `constructor` in `localStorage` was looked up on the object prototype, in the boot script and in `hydrateFromStorage`. Harmless (it only set empty CSS values, and writing `localStorage` already needs script access), but sloppy | **Fixed:** own-property checks in both places; regression test |
| F-3 | High (build time) / Critical (dev tools) | `npm audit` reported 8 vulnerabilities. Production: Next 15 bundles PostCSS 8.4.31 (GHSA-qx2v-qp2m-jg93 and the sourceMappingURL file-read advisories), which only processes this repo's own CSS at build time, so it wasn't exploitable here. Dev only: Vitest 2's tinypool, Vite, esbuild and `@vitest/mocker` | **Fixed:** `overrides` makes Next use the root PostCSS 8.5.32; Next 15.5.28 → 15.5.29; Vitest 2 → 5.1.0 with Vite 7. All tests unchanged and passing. `npm audit`: **0** |
| F-4 | Informational | GitHub Pages can't send headers, so `frame-ancestors`, HSTS and `nosniff` aren't available there (the `<meta>` CSP still applies) | Documented. Prefer Vercel, Netlify or Cloudflare Pages |
| F-5 | Informational | Uploaded PDFs can contain PDF JavaScript, which runs in the browser's PDF viewer sandbox, not on the site | Accepted: only you upload files, and only in dev |

## A · Build artifacts

- `scripts/verify-build.mjs` runs in every `npm run build` and in CI. It fails on dashboard files, `api/` paths, source maps, backups, `*.dev.*`, a `content/` folder, dev-only strings, and unhashed or inline-handler scripts. See [14-production-build.md](14-production-build.md#build-verification-scriptsverify-buildmjs). Its 19 unit tests include one per leak type.
- **Evidence:** the clean build passes. Against the served export (E2E-09 and curl):
  - `/dashboard`, `/dashboard/`, `/api/dev-dashboard/{content,uploads,backups}`, `/api/send-mix` and `/content/portfolio.json` all return **404**;
  - PUT, POST and DELETE are refused (405 from the preview server; static hosts reject them too).
- **After deploy:** run the same requests against the live URL:

```bash
for p in /dashboard/ /api/dev-dashboard/content /api/send-mix /content/portfolio.json; do curl -s -o /dev/null -w "%{http_code} $p\n" "https://YOUR-DOMAIN$p"; done
```

## B · Dev server and dashboard API

The dev server listens on `127.0.0.1:3000` only (`netstat`), and the machine's LAN address on port 3000 doesn't connect. Live requests against `/api/dev-dashboard/content`:

| Request | Expected | Got |
|---|---|---|
| Same-origin GET with the dashboard header | 200 | 200 |
| No dashboard header | 403 | 403 |
| DNS rebinding: `Host: evil.test` | 403 | 403 |
| `Host: 127.0.0.1.evil.test` | 403 | 403 |
| `Origin: https://evil.test` | 403 | 403 |
| `Origin: null` (sandboxed frame) | 403 | 403 |
| `Sec-Fetch-Site: cross-site` | 403 | 403 |
| PUT `text/plain` (simple-request CSRF) | 415 | 415 |
| PUT form-encoded without the header | 403 | 403 |
| PUT that fails the schema | 400 | 400 |
| Declared 3 MB body | 413 | 413 |
| Chunked 6 MB body | 413 | **400 before F-1** (fully read), 413 after |
| CORS preflight from `evil.test` | no `Access-Control-Allow-*` | none granted |

The guard's matrix is also covered by 31 unit tests in `tests/unit/dashboardServer.test.ts`, plus 3 new ones for bounded bodies. The production guard (NODE_ENV) returns 404, and in production the routes aren't compiled at all.

## C · File handling

- **Traversal:**
  - Restoring `../../package.json` → 404.
  - Deleting `..%2F..%2Fpackage.json` → 404.
  - `containedPath` rejects separators, NUL and anything that resolves outside its folder, and the name patterns allow only `[A-Za-z0-9_-]` stems.
- **Type confusion:**
  - An SVG with `<script>` named `.png` → 415.
  - HTML named `.pdf` → 415.
  - Types are detected from magic bytes, SVG is never accepted, and saved names are random, written with `wx` (no overwrite).
- **Writes:** validated, backed up (last 20 kept, gitignored), then atomic (temp file plus rename); a 409 is returned if the file changed on disk since the editor loaded it.

## D · Content injection (XSS)

- **URLs:** every URL in the content goes through `safeUrl` (http, https, mailto and tel only; whitespace, quotes and angle brackets are rejected). Internal links match `/^\/(?!\/)…$/`, images must be `/uploads/<name>.(png|jpg|webp|avif)`, and colours must be `#rrggbb`. The schema tests cover `javascript:`, `data:` and `vbscript:`.
- **Raw HTML:** the only `dangerouslySetInnerHTML` is the theme boot script. Its content-derived JSON escapes `<`, and its values are hex colours.
  - No `innerHTML`, `eval`, `new Function` or `document.write` anywhere in `src/`.
  - The AI answers and the cover letter are rendered as text; nothing parses them into markup.
- **New-tab links:** every `target="_blank"` link has `rel="noopener noreferrer"` (the dashboard's has `noreferrer`, which implies it), and every `window.open` passes `noopener,noreferrer`.
- **mailto:** `subject` and `body` are `encodeURIComponent`-encoded, and the address is schema-checked (`z.email()`).
- **Backstop:** even if markup slipped through, the CSP stops injected scripts (E2E-10 injects one; it doesn't run).

## E · Headers and CSP

- **On the export:**
  - Every page has the hashed `<meta>` CSP. `script-src` allows only `'self'` plus the build's own inline-script hashes, with no `unsafe-inline` or `unsafe-eval`.
  - The served headers include the full CSP with `frame-ancestors 'none'`, plus HSTS, `nosniff`, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy and COOP.
- **In the browser:** Home and `/resume/` raise **zero** CSP violations; an injected script and an iframe embed were both blocked (console checked).
- **After deploy:** check the live headers:

```bash
curl -sI https://YOUR-DOMAIN/ | grep -iE "content-security|strict-transport|x-frame|nosniff|referrer|permissions"
```

## F · Supply chain

- **Dependencies:** `npm audit` reports **0** vulnerabilities after F-3. The lockfile is committed; CI uses `npm ci` and fails on any moderate-or-worse advisory (`npm audit --audit-level=moderate`).
- **CI workflow (`.github/workflows/ci.yml`):** a read-only token (`permissions: contents: read`, `persist-credentials: false`). It runs:
  - the typecheck
  - the unit tests
  - the production build with verification
  - the full Playwright suite
  - a gitleaks scan of all history
- **CodeQL (`.github/workflows/codeql.yml`):** `security-extended` queries on every push, every PR, and weekly.
- **Dependabot (`.github/dependabot.yml`):** weekly updates for npm and for the Actions themselves.
- **Pinned Actions:** every Action is pinned to a full commit SHA, looked up from each project's release tags (checkout v7.0.1, setup-node v7.1.0, codeql-action v4.39.3, gitleaks-action v3.0.0, upload-artifact v7.0.2).

## G · Secrets

- **gitleaks over all 5 commits:** one hit, `linkedin-client-id` in the first commit's resume page. It is the LinkedIn *username* text "ibrahimshaikhh", not a credential. Allow-listed by fingerprint in `.gitleaksignore`.
- **gitleaks over `out/`:** no leaks.
- **Local hits:** the only other hits were Next's local preview-mode keys in `.next/` and `.next-dev/`, which are gitignored and never deployed.
- **Ignore rules:** `.gitignore` covers `.env*`, `content/.backups/`, `.next/`, `.next-dev/`, `out/` and test output. No `.env`, key or backup files are tracked.

## H · Repository and deployment governance (your action)

These settings close paths 1–3 of the threat model. They live in your accounts, so they can't be committed:

1. **GitHub → Settings → Branches → add a rule for `main`:**
   - require a pull request
   - require the **CI** and **CodeQL** checks
   - require review from code owners (`.github/CODEOWNERS` lists you for everything)
   - block force pushes and deletion
   - include administrators
2. **Turn on** secret scanning, push protection and private vulnerability reporting (Settings → Code security). `SECURITY.md` points reporters to the last of these.
3. **Two-factor authentication** on GitHub, the hosting account and the domain registrar. Use a passkey or app, not SMS.
4. **Hosting:**
   - production deploys only from `main`
   - previews for forks' pull requests disabled, or kept off the production domain
   - no other members with deploy rights
5. **DNS:** a registrar lock (transfer lock) on the domain, plus DNSSEC if the registrar supports it.
6. **Actions:** Settings → Actions → "Read repository contents permission" as the default token. Never add deploy keys or tokens as secrets unless a workflow really needs them.

## I · Privacy (your decision)

`content/portfolio.json` is public once the repository is. It contains:

- **Your phone number and email.** They are shown on the site anyway, so this is your choice.
- **Two faculty members' university email addresses**, in the recommenders section. Confirm they agree to their addresses (and letters) being published in a public repository, or remove the `email` fields; the site doesn't need them to work.

`content/portfolio.example.json` contains only placeholder data (`alex@example.com`, `jordan@example.com`, `+1 555 010 0000`).

## J · Licensing

- **Fonts:** `public/fonts/` tracks only the two Figtree files (SIL OFL 1.1) and their licence. The proprietary Circular files never entered git history.
- **No Spotify assets:** there are no Spotify logos, artwork or icons; covers are generated.
- **Licence:** the code is MIT.

## K · DAST

Run an OWASP ZAP baseline scan against the first preview deploy:

```bash
docker run --rm -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t https://YOUR-PREVIEW-URL
```

Expected warnings: `style-src 'unsafe-inline'` (needed for React style attributes, and covered by the strict `script-src`). Anything else should be triaged and recorded here.

## Re-running this audit

```bash
npm audit
```

```bash
npm run build
```

```bash
npm run test:unit
```

```bash
npm run test:e2e
```

```bash
gitleaks git .
```

Then repeat the live checks in A and E against the deployed URL.
