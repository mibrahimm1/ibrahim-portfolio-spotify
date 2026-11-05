# Spotify-inspired Developer Portfolio

An interactive portfolio that presents a developer's work the way a music app presents a library: projects, roles and credentials are "tracks", portfolio sections are "playlists", the tech stack shows up as "top artists", and recruiters can save items to a **Recruiter Mix** and send it with a call request.

Built with Next.js 15 (App Router), React 18, Zustand, Tailwind CSS and TypeScript.

> **Not affiliated with Spotify.** This is an independent project inspired by the Spotify desktop interface. It contains no Spotify logos, artwork, fonts or other brand assets. "Spotify" is a trademark of Spotify AB.

## Quick start

```bash
npm ci
```

```bash
npm run dev
```

Then open http://localhost:3000.

| Script | What it does |
|---|---|
| `npm run dev` | Development server on 127.0.0.1, with the content dashboard at /dashboard |
| `npm run build` | Static production build in `out/`, with a hashed CSP, verified to contain no dashboard or dev code |
| `npm run preview` | Serve `out/` locally at http://127.0.0.1:4173 with the production headers |
| `npm run test:unit` | Vitest unit tests |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run content:validate` | Check `content/portfolio.json` against the schema |
| `npm run content:reset` | Replace your content with the example template (backs up the old file) |

## Making it yours
All content (profile, projects, roles, education, references, AI answers, resume layout) lives in [`content/portfolio.json`](content/portfolio.json) and is validated against a schema.

1. Run `npm run dev` and open **http://localhost:3000/dashboard** to edit everything visually: add, remove and reorder items, upload images, restore backups. The dashboard only exists in development; production builds don't include it.
2. Or start from a neutral template with `npm run content:reset`, then edit in the dashboard or by hand.
3. Commit `content/` and `public/uploads/`, then deploy.

See [`docs/improvements/12-dashboard-guide.md`](docs/improvements/12-dashboard-guide.md) and [`11-content-model.md`](docs/improvements/11-content-model.md).

## Deploying
The production build is a static site, with no server and nothing that can write. Deploy `out/` to Vercel (`vercel.json`), Netlify (`netlify.toml`), Cloudflare Pages or GitHub Pages, at the root of a domain. Security headers come with the build. See [`docs/improvements/14-production-build.md`](docs/improvements/14-production-build.md).

## Security
The live site is static and can only change through a new build from this repository. The dashboard is development-only, and every page runs under a strict Content-Security-Policy. See [`SECURITY.md`](SECURITY.md) and the audit in [`docs/improvements/15-security-audit.md`](docs/improvements/15-security-audit.md).

## Phones and tablets
On phones the site switches to a Spotify-app-style layout: a tab bar (Home, Search, Your Library, Contact), a mini-player and full-screen player, bottom sheets, and Back-gesture support. Tablets keep the desktop layout with a compact library. See [`docs/improvements/13-mobile-spec.md`](docs/improvements/13-mobile-spec.md).

## Documentation
Design, architecture and behaviour notes live in [`docs/improvements/`](docs/improvements/README.md). The roadmap (mobile layout, dev-only content dashboard, static production build, security audit) is in [`docs/improvements/10-mobile-dashboard-security-plan.md`](docs/improvements/10-mobile-dashboard-security-plan.md).

## Licence
Source code: [MIT](LICENSE). Font: Figtree, [SIL OFL 1.1](public/fonts/LICENSE). The portfolio content describes a real person and isn't licensed for reuse; swap in your own when you fork.
