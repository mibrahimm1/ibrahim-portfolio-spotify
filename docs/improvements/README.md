# Improvement Pass — Spotify-Fidelity Refinement

**Date:** 4 November 2026
**Scope:** A line-by-line review of the whole codebase, a gap audit against the real Spotify desktop client, then a refinement pass covering visuals, interactions, state, accessibility and correctness.
**Result:** Typecheck clean · production build clean · **47/47 unit tests** (22 original + 25 new) · **8/8 Playwright E2E** (6 original + 2 new).

This folder documents everything that was analysed, found and changed. Read it in order, or jump to what you need:

| # | Document | What's in it |
|---|----------|--------------|
| 01 | [Codebase analysis](01-codebase-analysis.md) | A file-by-file walkthrough of the code as it was **before** this pass: what every module did and how they connected |
| 02 | [Spotify fidelity audit](02-spotify-fidelity-audit.md) | A zone-by-zone comparison with the real Spotify desktop client: what matched, what didn't, and what was done about it |
| 03 | [Bugs found and fixed](03-bugs-found-and-fixed.md) | 31 defects, each with symptom, root cause, fix and the test that covers it |
| 04 | [Change log](04-change-log.md) | Every added, modified and removed file, with a summary of the change |
| 05 | [Architecture](05-architecture.md) | How the new pieces fit together (store, catalog, routing, hooks, component tree) |
| 06 | [Design tokens](06-design-tokens.md) | Colours, type, spacing, radii, shadows and motion as implemented, plus deliberate deviations from the v2.0 blueprint |
| 07 | [Interaction spec](07-interaction-spec.md) | Exact behaviour of every control: click vs double-click, context menus, shuffle/repeat, keyboard shortcuts, URLs, persistence |
| 08 | [Testing](08-testing.md) | What the tests cover, how to run them, and the test changes that were needed |
| 09 | [Known limitations & next steps](09-limitations-and-next-steps.md) | Open decisions and things that still need you (calendar link, email delivery, font licensing…) |
| 10 | [Mobile, dashboard & security plan](10-mobile-dashboard-security-plan.md) | The approved 6-phase roadmap |
| 11 | [Content model](11-content-model.md) | Phase 1: `content/portfolio.json`, the schema and its security rules, the loader, scripts |
| 12 | [Content dashboard](12-dashboard-guide.md) | Phase 2: the dev-only editor, how it's kept out of production, and how its API is protected |
| 13 | [Mobile experience](13-mobile-spec.md) | Phase 3: the phone and tablet layouts, the Back-gesture history model, and their tests |
| 14 | [Production build](14-production-build.md) | Phase 4: the static export, the hashed CSP, build verification, and hosting setups |

## The short version

**Before:** the layout resembled Spotify, but the details gave it away. It had a bouncing green toast, a full-screen dimmed "search" modal, native browser tooltips, emoji in buttons, labels that wrapped onto two lines, a shuffle button that only skipped tracks, a static volume bar, no context menus, no sticky headers and no hover-revealed controls. Behind that were real bugs:

- The **Send Mix** form never delivered the recruiter's message.
- **Back** into Recruiter Mix showed the wrong playlist.
- The **AI "Inspect Project" chip** didn't load the project.
- The **resume page couldn't scroll**.
- Every component re-rendered **every second**.
- Several Tailwind classes (`animate-fade-in`, `animate-scale-up`, `scale-102`, `no-scrollbar`…) **didn't exist**, so they did nothing.

**After:** the app follows the real client's conventions:

- **Layout:** a 64px top bar with the Home disc and a search pill, a 72px player bar, and resizable panels with an icon-rail collapse.
- **Track rows:** select on click, play on double-click, hover-revealed play/save/more controls, and an animated equalizer on the playing row.
- **Shared UI:** context menus everywhere, Spotify tooltips and blue toasts.
- **Pages:** headers that size their title to fit and tint the page below, plus a sticky top bar that fills in as you scroll.
- **Player:** real shuffle, three-state repeat, a Queue panel and a working volume control.
- **Lyrics:** a synced canvas for the cover letter.
- **New views:** "This Is &lt;tech&gt;" playlists, a Browse grid, and shareable hash URLs for every view.

The design stays a clearly separate, Spotify-*inspired* portfolio: no Spotify logo, generated artwork instead of album art, and a footer stating it isn't affiliated with Spotify.

## Running it

```bash
npm run dev
```

```bash
npm run test:unit
```

```bash
npm run test:e2e
```

The original source as it stood before this pass is not under version control (the folder isn't a git repository). If you want an easy way to diff or roll back in future, consider running `git init` and committing.
