# 16 · Open-source packaging (Phase 6)

The goal: someone forks the repository, makes it their own portfolio in minutes, and their fork's CI passes from the first push, without inheriting any of the original author's personal data.

## What a forker does

The README's "Make it yours in 5 minutes" is the canonical version:

1. **Fork and install:** fork the repository, then `npm ci`.
2. **Run the setup:** `npm run setup -- --github <username>`.
3. **Edit:** `npm run dev`, then edit everything at `/dashboard`.
4. **Ship:** run `npm run build`, commit, and deploy to Vercel, Netlify, Cloudflare Pages or GitHub Pages.

### `npm run setup` (`scripts/setup-fork.mjs`)

| Step | Effect |
|---|---|
| Content | `content/portfolio.json` ← `content/portfolio.example.json`, after a backup to `content/.backups/` |
| Resume | `public/resume.pdf` ← a generated one-page placeholder ("Your resume goes here"). The original was a placeholder too, but it carried the author's name and email |
| Uploads | Everything in `public/uploads/` is deleted (it belonged to the original content) |
| Code owners | Every handle in `.github/CODEOWNERS` → `@<username>` |

The script asks for confirmation (or takes `--yes`), validates the username, and prints the next steps. These include adding your name to `LICENSE` while keeping the original notice, as MIT requires.

## Tests that survive a fork

Before this phase, the tests asserted the author's own content: Horquva, BizBuddy, the "89%" answer, the faculty names. A fork that replaced `portfolio.json` would have failed its own CI straight away. The fix: **tests never read `content/portfolio.json` any more.**

- **`tests/fixtures/portfolio.json`:** a frozen copy of the original content with the contact details replaced (`owner@example.com`, `555-010-0100`, `referee1@example.edu`). It is the only content the tests see.
- **`@portfolio-content`:** the loader (`src/data/portfolioData.ts`) imports this alias instead of a fixed path.
  - In builds and in dev, `next.config.mjs` maps it to `content/portfolio.json`, or to `PORTFOLIO_CONTENT` when that's set; the path must be a `.json` file inside the project.
  - `vitest.config.ts` always maps it to the fixture.
- **E2E servers:** Playwright starts two servers with `PORTFOLIO_CONTENT=tests/fixtures/portfolio.json`.
  - A production build exported to **`out-e2e/`**, served on port 4174.
  - A dev server on port 3100, built in `.next-dev-e2e/`.
  - Neither touches your deployable `out/`, your own dev server (3000) or your preview (4173).
  - The dashboard tests edit and restore the fixture, never your content. The content store follows `PORTFOLIO_CONTENT` too.
- **`npm run content:validate`** still validates *your* `content/portfolio.json`, plus the example and the fixture. The schema rule tests run on the fixture.
- **No content in product code:** the code no longer contains author-specific strings.
  - The "NUST faculty directory" button text is now the content field `facultyProfileLabel`, defaulting to "Faculty profile", and is editable in the dashboard.
  - A test-only hack in the search testids is gone (`starter-prompt-<id>`).
  - The `localStorage` keys are `portfolio_*` instead of `ibrahim_*`.
  - The package is `spotify-style-portfolio`.

### A bug the fork simulation caught: stale build cache

Next's persistent webpack cache in `.next/` doesn't track the `@portfolio-content` alias. In the simulated fork, a test build reused modules from the previous build and shipped the example content instead of the fixture. The reverse, **a real `npm run build` after a test run shipping the fixture to `out/`**, would have published the wrong site. Two fixes:

1. `next.config.mjs` adds the content path to `config.cache.version`, so builds of different content never share cached modules.
2. `scripts/verify-build.mjs` now fails the build if `out/index.html`'s `<title>` doesn't match `site.title` of the content it was meant to use (unit-tested).

## Fork simulation (evidence)

I copied the repository, minus `node_modules` and build output, to a scratch folder and ran it as a new user would:

| Step | Result |
|---|---|
| `npm ci` | 221 packages, clean |
| `npm run setup -- --github octocat --yes` | Content reset, placeholder PDF, CODEOWNERS → `@octocat` |
| `npm run test:unit` | 150 / 150 (after fixing the template-privacy test, which wrongly failed when your content *is* the template) |
| `npm run build` | Passes; title "Alex Rivera — Full-Stack Engineer \| Portfolio" |
| Personal data in the fork's `out/` | **None**: no matches for the author's name, phone, email domain or project names |
| `npm run test:e2e` | 34 / 34, run with the stale cache left in place |
| Real build straight after a test build | Example content in `out/`, no fixture data; a tampered title is rejected by `verify-build` |

## Repository files added

- `README.md`, rewritten around forking:
  - features
  - the five-minute setup
  - scripts
  - deploy options per host
  - project layout
  - security, contributing and licence
- `CONTRIBUTING.md`: setup, the checks CI runs, and the rules (tests against the fixture, schema-first content, static production, no inline scripts, no Spotify assets).
- `.github/ISSUE_TEMPLATE/bug_report.yml`, `config.yml` (security reports go to private reporting) and `pull_request_template.md`.
- `.github/workflows/pages.yml`: optional GitHub Pages deploy with SHA-pinned Actions. It runs only when the repository variable `DEPLOY_TO_PAGES` is `true`, so forks that deploy elsewhere don't get failing runs.
- `package.json`:
  - `description`
  - `engines.node >= 22.12`
  - the `setup` script

## Release checklist (for the original repository)

1. **Third-party data:** decide on the two faculty email addresses in `content/portfolio.json` (audit § I).
2. **Your files:** replace `public/resume.pdf` with your real resume, or upload one in the dashboard.
3. **Publish:** push to GitHub, make the repository public, and confirm the **CI** and **CodeQL** workflows pass.
4. **Account settings:** apply audit § H (branch protection with required checks and code-owner review, secret scanning and push protection, private vulnerability reporting, 2FA).
5. **Deploy, then verify:**
   - Run the live `curl` checks from audit § A and § E.
   - Run a ZAP baseline scan (audit § K).
   - Add the live URL to the README's opening paragraph and the repository's About box.
6. **Discoverability (optional):** GitHub topics such as `portfolio`, `nextjs`, `portfolio-template` and `static-site`.
