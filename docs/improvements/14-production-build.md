# 14 · Production build (Phase 4)

`npm run build` now produces a **static export**: plain HTML, CSS, JS and assets in `out/`. There is no server in production. The live site has no route that accepts a write, no API and no dashboard, so its content can only change through a new build from the repository.

## The build pipeline

```bash
npm run build
```

It runs four steps and stops at the first failure:

| Step | What it does |
|---|---|
| `npm run content:validate` | `content/portfolio.json` must match the schema (links, ids, references) |
| `next build` | Static export to `out/`. The `*.dev.tsx` / `*.dev.ts` dashboard files aren't routes in this phase, so they are never compiled |
| `node scripts/secure-export.mjs` | Adds the hashed CSP `<meta>` to every page and writes `out/_headers` and `out/.nojekyll` |
| `node scripts/verify-build.mjs` | Fails the build if anything dev-only or unprotected is in `out/` (below) |

Then preview exactly what will be deployed:

```bash
npm run preview
```

That serves `out/` at http://127.0.0.1:4173 with the headers from `out/_headers`, using `scripts/serve-out.mjs`, which has no dependencies. It accepts only GET and HEAD, and serves `404.html` for anything else.

## Configuration (`next.config.mjs`)

| Phase | Settings |
|---|---|
| `next dev` | Dashboard routes enabled (`pageExtensions` includes `dev.tsx`, `dev.ts`); its own `distDir: '.next-dev'`, so a build can run while dev is up |
| Everything else | `output: 'export'`, `trailingSlash: true` (`/resume/index.html` works on every host), `images.unoptimized`, `productionBrowserSourceMaps: false`, `poweredByHeader: false` |

`.next-dev` is excluded from TypeScript. Otherwise the build's type check sees the dev server's route list, which includes `/dashboard`.

## Removed

- **`src/app/api/send-mix/route.ts`.** A static site can't have API routes. Send Mix already delivered through the visitor's mail client (`mailto:`), and the route only logged metadata, so `SendMixModal` lost only its `fetch`.

## Content-Security-Policy

Next inlines each page's data as small `<script>` blocks, and the theme boot script in `layout.tsx` is inline too. Their contents change with every build, so the hashes are computed **after** the build:

- **Per page (`<meta>`, first element in `<head>`):**
  ```
  default-src 'self'; script-src 'self' 'sha256-…' (one per inline script);
  style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self';
  manifest-src 'self'; media-src 'self'; object-src 'none'; worker-src 'none'; frame-src 'none';
  base-uri 'self'; form-action 'none'
  ```
  Only the build's own scripts can run. An injected `<script>` (from a content bug, say) is blocked; the E2E tests check this.
  - `style-src 'unsafe-inline'` is for React `style={…}` attributes, which set cover colours and gradients.
  - `form-action 'none'` is safe because every form is handled in JavaScript and never submits.
- **As an HTTP header** (`out/_headers`, `vercel.json`):
  - The same policy, plus `frame-ancestors 'none'`, which browsers ignore in `<meta>`.
  - `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, microphone, geolocation, payment, USB off) and `Cross-Origin-Opener-Policy: same-origin`.
  - `vercel.json` can't know the build's hashes, so its header CSP is the hash-free part only (`object-src`, `base-uri`, `form-action`, `frame-ancestors`). The `<meta>` policy enforces the rest. Two policies only ever make each other stricter.
- **One source of truth.** All headers are defined in `scripts/security-headers.mjs`. A unit test fails if `vercel.json` drifts from it.
- **Boot script.** It already escapes `<` in the content-derived JSON, so a `</script>` in a theme name stays inert. Its hash is picked up with the others.

## Build verification (`scripts/verify-build.mjs`)

The build fails if `out/` contains:

- **Forbidden files:**
  - anything named `dashboard`
  - an `api/` folder
  - `.map` source maps
  - `.backups`
  - `*.dev.*` files
  - a `content/` folder
- **Dev-only code:** `dev-dashboard`, `x-portfolio-dashboard`, `writeFile`, `.backups`, `/dashboard#` (the in-site Edit links), `dev-edit-button` or `sourceMappingURL` in any text file. This proves the `NODE_ENV === 'development'` branches were really removed.
- **A page with a weak or missing CSP:** a page with no CSP `<meta>`, the `<meta>` placed after a script, an inline script whose hash isn't listed, `unsafe-inline` or `unsafe-eval` in `script-src`, inline `on…=` handlers, or `javascript:` links.
- **Missing required files:** `index.html`, `resume/index.html`, `404.html` or `_headers`.
- **The wrong content:** the home page `<title>` must match `site.title` of the content file the build was meant to use. This catches a stale build cache shipping other content (added in Phase 6).

## Hosting

| Host | Setup | Headers |
|---|---|---|
| **Vercel** | Import the repo. `vercel.json` sets `framework: null` (plain static hosting, so no serverless functions can exist), `npm run build`, output `out` | `vercel.json` header CSP plus the `<meta>` CSP |
| **Netlify** | `netlify.toml` (build `npm run build`, publish `out`, Node 22) | `out/_headers`, full CSP |
| **Cloudflare Pages** | Build command `npm run build`, output directory `out` | `out/_headers`, full CSP |
| **GitHub Pages** | Build in an Action and upload `out/` (an example workflow comes with Phase 6). `out/.nojekyll` stops Jekyll hiding `_next/` | Only the `<meta>` CSP: Pages can't set headers, so `frame-ancestors` and HSTS aren't available there |

The site must be served from the root of its domain: a custom domain, `username.github.io`, or any of the hosts above. The code links to `/resume`, `/uploads/…` and `/fonts/…` from the root. A GitHub Pages *project* site under `/repo-name/` would need a `basePath` and prefixed asset paths, which aren't supported yet.

## Tests

| Where | What |
|---|---|
| `tests/unit/buildLockdown.test.ts` (19) | Script hashing; `<meta>` placement; running the script twice; `verify()` rejecting each kind of leak or missing file and passing a clean export; `vercel.json` matching the shared headers |
| E2E-09 (desktop project) | Against the real export: `/dashboard`, all `/api/dev-dashboard/*`, `/api/send-mix` and `/content/portfolio.json` return 404; PUT, POST and DELETE are refused |
| E2E-10 (desktop project) | The response carries the header CSP and `nosniff`; Home and `/resume/` run with **zero CSP violations**; an injected inline script does not run |
| Playwright config | The desktop and both phone projects run against a real production build of the test content (`out-e2e/`, port 4174), so every flow is tested under the production CSP. The dashboard project uses a dev server on port 3100. Both use `tests/fixtures/portfolio.json` (see [16-open-source.md](16-open-source.md)) |

**Totals:** 144 unit tests and 34 Playwright tests, all passing.
