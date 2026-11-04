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
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run test:unit` | Vitest unit tests |
| `npm run test:e2e` | Playwright end-to-end tests |

## Documentation
Design, architecture and behaviour notes live in [`docs/improvements/`](docs/improvements/README.md). The roadmap (mobile layout, dev-only content dashboard, static production build, security audit) is in [`docs/improvements/10-mobile-dashboard-security-plan.md`](docs/improvements/10-mobile-dashboard-security-plan.md).

## Licence
Source code: [MIT](LICENSE). Font: Figtree, [SIL OFL 1.1](public/fonts/LICENSE). The portfolio content describes a real person and isn't licensed for reuse; swap in your own when you fork.
