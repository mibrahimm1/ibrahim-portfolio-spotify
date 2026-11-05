# 17 · Standard portfolio page (Phase 7)

`/resume` used to be a plain printable résumé sheet. It is now a single-page portfolio for visitors who'd rather skip the Spotify-style app. Every "Standard resume view" link still lands here, and printing it still produces a one-page résumé. All content comes from `content/portfolio.json`; there's nothing to maintain twice.

## What we learned from the references, and what we changed

| | Reference | What we kept | What we did differently |
|---|---|---|---|
| **Layout** | shahmeerirfan.codes | The information architecture: hero with a rotating headline and profile card → companies strip → two-column project cards → project list → experience rows → testimonials → call to action. A 1120px column, generous whitespace, tight medium-weight headings, a scroll-progress line | **Generated posters** instead of screenshots: each project's measured result (the first claim of its `hook`, e.g. "14,000+ Chest X-Rays") is set large over a gradient from the item's own `coverColor`, so every fork gets distinct covers without designing any. A warm **paper and ink** palette and a **dot grid** instead of pale blue with a square grid. Figtree instead of Manrope. The accent follows the visitor's accent theme |
| **Motion** | aadarshrai.vercel.app | The cursor-follow project preview with a "View" bubble, rows dimming around the hovered one, magnetic round calls to action with a rising fill, a header that condenses on scroll, a footer revealed under a rounded section edge, a live local-time clock, and a marquee whose speed follows the scroll | **No blocking preloader** (a ~0.9s CSS entrance instead) and **no smooth-scroll hijacking** (native scrolling): a recruiter's 30-second scan comes first. One calmer easing curve, `cubic-bezier(0.22,1,0.36,1)`. The marquee carries the tech stack, not the name. Everything degrades: pointer effects need a mouse, and `prefers-reduced-motion` keeps only fades |

## Sections

1. **Nav:** name, section links, "Interactive version" and "Résumé". It condenses into a floating pill after 120px of scroll; on phones it opens a full-screen menu.
2. **Hero:**
   - an availability pill, then the headline `heroPrefix` + rotating phrase + `heroSuffix`;
   - an intro taken from the first sentences of `profile.bio`;
   - the "Book a call" (magnetic) and "See my work" links;
   - the profile card (photo or initials, location, live time, links, tilting toward the cursor);
   - proof chips from `profile.tagline`.
3. **Proof strip:** "Shipped at" with the companies from Experience, then the stack marquee.
4. **Selected work:** poster cards for `landing.featuredProjectIds`. Hovering zooms the poster and shows an arrow. The figure counts up the first time a card scrolls into view.
5. **More projects:** the rest of the playlist as large-type rows, with the cursor-follow preview on a mouse and a plain list on touch.
6. **Where I've worked:** rows that expand to `details` and `credits` on hover, click, or Enter.
7. **Education & recognition:** education, research and honours columns.
8. **What mentors say:** `recommenders[].quote` (falls back to the first sentence of the letter's second paragraph), with a link to the full letter in the app.
9. **Beyond work:** playlists not used anywhere else (volunteering, for you) as a swipeable strip.
10. **Contact and footer:** the heading, email (click to copy) and phone, a magnetic round "Book a call", then the ink footer with local time and links.

**Print:** the `PrintResume` block (`data-print-only`) is the old résumé layout, still driven by `resume.sections`. Everything marked `data-screen-only` is hidden on paper.

## Motion system (`src/components/landing/motion/`, no dependencies)

| Piece | Notes |
|---|---|
| `media.ts` | `useReducedMotion`, `useFinePointer`, `usePointerEffects` (`useSyncExternalStore` on media queries) |
| `reveal.ts` | `useReveals(root)`: nothing is hidden in the static HTML. After hydration, only elements still below the viewport are set to `pending` and revealed once by an IntersectionObserver; `beforeprint` shows everything. `revealDelay(i)` staggers siblings |
| `pointer.ts` | `useMagnetic`, `useTilt`, and `useFollower`: per-frame easing toward the pointer, written to CSS variables (`--fx`/`--fy`), so React doesn't re-render while it moves |
| `Animated.tsx` | `WordRotator` (all phrases share one grid cell, so the layout never jumps; hidden from screen readers, which get the full sentence), `Marquee` (a CSS loop whose `playbackRate` follows scroll velocity through the Web Animations API), `CountUp`, `LocalTime`, `useScrollProgress`, `useScrolledPast` |
| `src/app/resume/landing.css` | Palette tokens for light and dark (`prefers-color-scheme`), the hero entrance keyframes, reveal states, the link underline, the round-button fill, and print rules. It also unlocks document scrolling for this page (`body:has([data-landing])`), since the app shell locks the body |

## Content and dashboard

- **New optional `landing` object and `recommenders[].quote`:** see [11-content-model.md](11-content-model.md).
- **Dashboard:** the "Portfolio page" section, formerly "Resume page", edits all of it. Deleting or renaming a project or playlist also updates the poster list and the projects playlist.
- **Model:** `src/lib/landing.ts` builds the page model as pure functions, which unit tests cover.

## Verification

- **Unit (`tests/unit/landing.test.tsx`, 17 tests):**
  - the configured and default models
  - figure splitting
  - quote fallback
  - posters for every project
  - the schema rules (unknown poster id, bad time zone, `landing` missing)
  - the rotator advancing, and holding still under reduced motion
  - no cursor preview on touch
- **E2E (`tests/e2e/landing.spec.ts`, run in the desktop, Android and iPhone projects):**
  - the rotating headline
  - the booking link
  - the preview on hover (mouse) and its absence on touch
  - an experience row expanding from the keyboard
  - copying the email
  - no horizontal scroll at 360px
  - the print layout
  - reduced motion
  - every section revealed after scrolling, with nothing stuck hidden
  - the link back to the app
  - E2E-10 checks `/resume/` for zero CSP violations
- **Build:** `/resume` first-load JS is 142 kB (131 kB before), and `verify-build` passes.
- **Checked by hand:** light and dark; 1440, 1024, 768, 375 and 360px widths; keyboard order (39 named controls); hover states.

**Not done:** a Lighthouse run against a deployed preview.
