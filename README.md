# Spotify-inspired Developer Portfolio

An interactive portfolio that presents a developer's work the way a music app presents a library. Projects, roles and credentials are "tracks", portfolio sections are "playlists", the tech stack shows up as "top artists", and recruiters can save items to a **Recruiter Mix** and send it with a call request. Fork it, fill in your own content in a visual editor, and deploy it as a static site.

> **Not affiliated with Spotify.** This is an independent project inspired by the Spotify desktop and mobile apps. It contains no Spotify logos, artwork, fonts or other brand assets. "Spotify" is a trademark of Spotify AB.

## Features

- **Desktop layout:**
  - resizable library and Now Playing panels
  - context menus, a queue, and keyboard shortcuts
  - shareable URLs for every page
- **Phone layout:**
  - tab bar, mini-player and full-screen player
  - bottom sheets, and support for the Back gesture
  - tablets get a compact desktop layout
- **Ask-the-AI search:** suggested questions and answers you write yourself. It runs locally, with no API keys.
- **Recruiter Mix:** visitors save items, then send them to you through their mail app, together with a booking link.
- **Standard portfolio page (`/resume`):** a classic single-page layout for visitors who'd rather skip the app, with generated project posters, a cursor-follow project preview, light and dark themes, and a one-page résumé when printed.
- **Content dashboard:** edit everything visually, with uploads, validation and backups. It exists only in development.
- **Locked-down production:**
  - a static export with no server
  - a strict, hashed Content-Security-Policy
  - a build that fails if dev code leaks into the output
- **Tested:** unit tests (Vitest) and end-to-end tests (Playwright) on desktop, Android and iPhone viewports, run in CI on every push.

Built with Next.js 15 (App Router), React 18, Zustand, Tailwind CSS, zod and TypeScript. Requires Node 22.12 or newer.

## Make it yours in 5 minutes

1. **Fork** this repository on GitHub and clone your fork.
2. Install the dependencies:
   ```bash
   npm ci
   ```
3. Remove the original owner's content and files (it starts you from a neutral example and puts your username in `CODEOWNERS`):
   ```bash
   npm run setup -- --github your-github-username
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open **http://localhost:3000/dashboard** and edit: profile, projects, experience, education, references, AI answers, colours. Upload your photo and resume PDF. Every save validates the content and keeps a backup, and the site preview updates live.
6. Check the production build:
   ```bash
   npm run build
   ```
7. Commit `content/` and `public/`, push, and [deploy](#deploy).

You can also edit [`content/portfolio.json`](content/portfolio.json) by hand; `npm run content:validate` checks it. The dashboard guide is in [`12-dashboard-guide.md`](docs/improvements/12-dashboard-guide.md), and every field is described in [`11-content-model.md`](docs/improvements/11-content-model.md).

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server on 127.0.0.1:3000, with the content dashboard at `/dashboard` |
| `npm run build` | Validates the content, builds the static site in `out/`, adds the CSP, and verifies the output |
| `npm run preview` | Serves `out/` at http://127.0.0.1:4173 with the production headers |
| `npm run test:unit` | Unit tests |
| `npm run test:e2e` | End-to-end tests (builds a test copy of the site; installs nothing globally) |
| `npm run content:validate` | Checks `content/portfolio.json` against the schema |
| `npm run content:reset` | Replaces your content with the example template (backs up the old file) |
| `npm run setup -- --github <you>` | One-time fork setup (above) |

The first `npm run test:e2e` needs a browser:

```bash
npx playwright install chromium
```

## Deploy

The production build is plain files in `out/`. There is no server, and nothing in production can change your content.

| Host | How |
|---|---|
| **Vercel** | Import the repository. `vercel.json` already sets the build command, output folder and security headers |
| **Netlify** | Import the repository. `netlify.toml` does the rest; headers come from the generated `out/_headers` |
| **Cloudflare Pages** | Build command `npm run build`, output directory `out` |
| **GitHub Pages** | Settings → Pages → Source: GitHub Actions, then set the repository variable `DEPLOY_TO_PAGES` to `true`. The included workflow deploys on every push to `main` |

Serve the site from the root of a domain: a custom domain, `username.github.io`, or any of the hosts above. GitHub Pages can't send HTTP headers, so the other hosts get the stronger header set. Details are in [`14-production-build.md`](docs/improvements/14-production-build.md).

After the first deploy, follow the account checklist in the [security audit](docs/improvements/15-security-audit.md#h--repository-and-deployment-governance-your-action): branch protection, two-factor authentication, and a domain lock. It's what keeps anyone else from changing your live site.

## How it's built

| Path | What's there |
|---|---|
| `content/portfolio.json` | All your content: the only file you normally edit |
| `src/content/schema.ts` | The content schema, including the security rules for links and image paths |
| `src/data/portfolioData.ts` | Loads the content into the shapes the UI uses |
| `src/stores/usePortfolioStore.ts` | App state: player, queue, history, overlays and preferences |
| `src/components/` | `shell/` (desktop frame), `mobile/` (phone frame), `stage/` (pages), `dashboard/` (dev-only editor) |
| `src/app/dashboard/`, `src/app/api/dev-dashboard/` | Dashboard routes, named `*.dev.tsx` / `*.dev.ts` so they exist only under `npm run dev` |
| `scripts/` | Post-build CSP and verification, preview server, fork setup |
| `tests/` | Unit and E2E tests. They run on `tests/fixtures/portfolio.json`, so they pass whatever your own content says |

Architecture, design tokens, interaction details and the mobile spec are in [`docs/improvements/`](docs/improvements/README.md).

## Security

The live site is static and can only change through a new build from your repository. The dashboard is development-only and accepts requests from localhost only; every page runs under a strict Content-Security-Policy. See [`SECURITY.md`](SECURITY.md) and the full [audit](docs/improvements/15-security-audit.md).

## Contributing

Bug reports and pull requests are welcome. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Licence

The source code is [MIT](LICENSE). The Figtree font is [SIL OFL 1.1](public/fonts/LICENSE). The content in `content/portfolio.json` and `public/resume.pdf` describes the original author and isn't licensed for reuse; `npm run setup` replaces it in your fork.
