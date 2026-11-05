# Plan: Mobile (Spotify app) experience · Dev-only content dashboard · Production lockdown & security audit

**Progress:** Phase 0 ✅ · Phase 1 ✅ ([11-content-model.md](11-content-model.md)) · Phase 2 ✅ ([12-dashboard-guide.md](12-dashboard-guide.md)) · Phase 3 ✅ ([13-mobile-spec.md](13-mobile-spec.md)) · Phases 4–6 pending.

**Deviation in Phase 2:** the API lives at `/api/dev-dashboard/*`, not `/api/__dashboard/*`, because Next.js treats folders starting with `_` as private and never routes them.

## Context
The portfolio is a Spotify-desktop-style Next.js 15 app (see `docs/improvements/`). Three needs drive this plan:

1. **Mobile.** It's desktop-only today (`body { min-width: 1024px }`), and recruiters often open links on phones. It should feel like the **Spotify mobile app**.
2. **Editing.** All content is hard-coded TypeScript (`src/data/portfolioData.ts`) plus copy buried in components (`aiEngine.ts` answers, resume skills, "MIS" initials…). You want a **dashboard** to add, edit and remove everything, available **only in `npm run dev`**.
3. **Open source.** The project will be published for others to fork, so content must be data-driven, the production site must be **immutable** (no one can change it except by committing to your repo), and the codebase needs a security audit before launch.

**Decisions made:**

| Decision | Choice |
|---|---|
| Content store | `content/portfolio.json` in the repo, written by the dashboard in dev |
| Images | Uploads saved to `public/uploads/` |
| Mobile model | Native-app pattern: tab bar, mini-player, full-screen player |
| Production | Static export (`output: 'export'`), so there is no server at all |

---

## Phase 0 · Prerequisites (do first)
- `git init` + an initial commit, so every later phase is reviewable and reversible.
- **Replace the Circular fonts before publishing.** `public/fonts/circular-*.woff2` are proprietary and must not ship in a public repo. Swap to **Figtree** (OFL, already referenced by the blueprint) self-hosted in `public/fonts/`, update the `@font-face` rules in `src/app/globals.css` and the preloads in `src/app/layout.tsx`, and add the OFL text to `public/fonts/LICENSE`.
- Add `LICENSE` (MIT), and a README disclaimer saying the project isn't affiliated with Spotify and no Spotify assets are included.
- Add one dependency, `zod` (schema validation shared by the build, the dashboard and CI). Nothing else new.

---

## Phase 1 · Make all content data-driven

### 1.1 Content file and schema
- New `content/portfolio.json` (the single editable source) and `content/portfolio.example.json` (a neutral template forkers can reset to).
- New `src/content/schema.ts`: a zod `PortfolioSchema` with `schemaVersion: 1`. Sections:
  - `site`: title, description, keywords, author, ogImage, themeColor
  - `profile`: today's `CandidateProfile` fields plus `initials` ("MIS"), `avatarLetter` ("I"), `avatarImage?`, `verifiedLabel`, `availabilityLine`, `locationChip`, `resumePdf` path
  - `technologies[]`: `TechnologyAvatar` plus `image?`
  - `playlists[]`: id, title, description, subtitle, coverColor, `coverImage?`, `artKind`, and `tracks[]` (today's `Track` plus `coverImage?`)
  - `recruiterMix`: title and description only (it stays virtual)
  - `recommenders[]` (plus `photo?`), `starterPrompts[]`
  - `ai`: `{ intents: [{ id, keywords[], answer, trackId? }], defaultAnswer }`, with `{email}`, `{phone}` and `{name}` placeholders
  - `accentThemes[]`, `coverLetterStanzas[]`
  - `resume`: a skills block (moved out of `src/app/resume/page.tsx`)
  - `whatsNew[]` (track ids; today these are hard-coded in `TopNavBar.tsx`)
  - `footer` link columns
- **Field rules** in the schema:
  - `safeUrl`: only `https:`, `http:`, `mailto:` and `tel:`
  - hex colours
  - ids are slugs
  - image paths must start with `/uploads/`
  - string length caps
  - a `superRefine` for **referential integrity**: every `recommenderId`, `linkedTrackId`, `referencedTrackId`, `intent.trackId` and `whatsNew` id must exist; all ids must be unique.

### 1.2 Loader (keeps every component unchanged)
- `src/data/portfolioData.ts` becomes a thin loader: it imports the JSON, runs `PortfolioSchema.parse()` (an invalid file **fails the build**), and re-exports the **same names** used today: `candidateProfile`, `technologyAvatars`, `featuredProjectsTracks`, `workExperienceTracks`, `educationTracks`, `publicationTracks`, `volunteeringTracks`, `certificationsTracks`, `allPlaylists` (with the virtual Recruiter Mix injected at index 0), `recommenders`, `starterPrompts`, `accentThemes`, `coverLetterStanzas`, plus new `site`, `aiConfig`, `resumeConfig`, `whatsNew`, `footer`.
- The per-section arrays (`featuredProjectsTracks`…) are derived by playlist id so existing tests keep passing. The generic code paths use `allPlaylists`.
- `src/types/portfolio.ts`: types become `z.infer<>` re-exports.

### 1.3 De-hard-code
| Where | Change |
|---|---|
| `src/lib/aiEngine.ts` | Iterate `aiConfig.intents` (keep the word-start matcher) instead of 12 hard-coded branches; the same answers move into JSON so the 8 existing tests still pass |
| `src/app/layout.tsx` | Metadata comes from `site` |
| `src/components/stage/HomeProfileView.tsx` | Read initials, availability line and verified label from `profile` |
| `src/app/resume/page.tsx` | Read skills from `resume`; DOI text from the track |
| `src/components/stage/CenterStage.tsx` | Footer comes from `footer` |
| `src/components/shell/TopNavBar.tsx` | "What's New" comes from `whatsNew` |
| `src/components/common/CoverArt.tsx` | Takes an `image?` prop and renders an `<img>` (loading="lazy", alt from title) when it's set, otherwise the generated art. `PLAYLIST_ART` comes from `playlist.artKind` |

---

## Phase 2 · Dev-only dashboard

### 2.1 How "dev-only" is guaranteed (defence in depth)
1. **The files aren't compiled into production at all.** `next.config.mjs` becomes a phase function. In `PHASE_DEVELOPMENT_SERVER` it sets `pageExtensions: ['dev.tsx','dev.ts','tsx','ts']`; otherwise `['tsx','ts']` and `output: 'export'`. Dashboard files are named `page.dev.tsx` / `route.dev.ts`, so in production they're plain non-route files that are never bundled.
2. **A runtime guard in every dev route:** return 404 unless `process.env.NODE_ENV === 'development'`.
3. **Request checks**, so a malicious website you visit while the dev server runs can't write to it (CSRF / DNS-rebinding):
   - The `Host` must be `localhost` or `127.0.0.1:<port>`.
   - The `Origin` must equal that host.
   - The request must carry an `x-portfolio-dashboard: 1` header and `application/json` (which forces a CORS preflight that is never approved).
4. `npm run dev` binds to `127.0.0.1` (`next dev -H 127.0.0.1`), so nothing on the LAN can reach it.
5. The production build is verified to contain no dashboard artifacts (Phase 5).

The dev-only "Edit" affordances inside the main site are wrapped in `process.env.NODE_ENV === 'development'` checks, so the production compiler removes them.

### 2.2 Files
| File | Purpose |
|---|---|
| `src/app/dashboard/page.dev.tsx`, `layout.dev.tsx` | Dashboard UI shell |
| `src/app/api/__dashboard/content/route.dev.ts` | `GET` (read JSON) · `PUT` (validate with `PortfolioSchema` → write `content/.backups/portfolio-<ISO>.json` (keep the last 20, gitignored) → atomic write via temp file + `rename`) |
| `src/app/api/__dashboard/upload/route.dev.ts` | `POST` multipart: allowlist png/jpg/webp/avif **by magic bytes**, ≤ 5 MB, **no SVG**, random file name `public/uploads/<nanoid>.<ext>`, returns the path |
| `src/app/api/__dashboard/backups/route.dev.ts` | List and restore backups |
| `src/app/api/__dashboard/_lib/guard.dev.ts` | Shared host/origin/header/env checks; `resolve()` + `startsWith(root)` path containment |
| `src/components/dashboard/*` | UI (below) |
| `scripts/content-validate.mjs` | CLI validation for CI |
| `scripts/content-reset.mjs` | Copy the example over the real file (for forkers) |

### 2.3 Dashboard UX (Spotify-styled, reusing `SpotifyButton`, `IconButton`, `Dialog`, `CoverArt`, `Tooltip`, `Toast`)
- **Layout:** a left nav of sections, an editor in the centre, and a live preview on the right (an `<iframe src="/">`; saving the JSON triggers Next HMR, so the preview refreshes itself). Below 768px the preview becomes a tab.
- **Sections:**
  1. Profile (contact details, bio, avatar upload, resume PDF upload)
  2. Site & SEO
  3. Playlists → tracks (master-detail)
  4. Tech stack
  5. Recommenders (letters as a paragraph list)
  6. AI assistant (starter prompts, intents with a **test box** that runs `processAIQuery` live against the draft)
  7. Cover letter stanzas
  8. Accent themes
  9. What's New & footer
  10. Media library (uploaded files, with "unused" detection)
  11. Raw JSON (editor with validation)
  12. Backups (restore)
- **List editing everywhere:** add, duplicate, delete (confirmation dialog listing anything that references the item, e.g. "used by 2 recommenders"), reorder with drag plus ↑/↓ buttons (keyboard accessible).
- **Forms:** generated from schema metadata. Field types are text, textarea, URL (with scheme check), colour (palette swatches plus a white-text contrast preview via `deepTone` from `src/lib/color.ts`), track-id select, image picker, and string-list.
- **Validation:** inline errors mapped from zod issue paths; Save is disabled while invalid.
- **Draft model:**
  - A client-side draft with a dirty indicator, Ctrl/⌘+S to save, and Revert.
  - A `beforeunload` warning when there are unsaved changes.
  - Import/Export JSON.
  - "Reset to template" (confirmation required).
- **IDs:** auto-slugged from the title on create, editable, unique-checked; renaming an id updates its references (with a confirmation).
- **In-site shortcuts (dev only):** a floating "Edit" pill on the portfolio, and an "Edit in dashboard" context-menu item on tracks/playlists that deep-links to `/dashboard#track/<id>`.

---

## Phase 3 · Spotify mobile experience (responsive)

### 3.1 Breakpoints and global changes
| Range | Layout |
|---|---|
| `< 768px` | **Mobile app shell** |
| `768–1023px` | Desktop shell; library forced to the 72px rail; Now Playing view opens as an overlay drawer instead of a column |
| `≥ 1024px` | Current desktop |

Global changes:
- Remove `min-width: 1024px`; use `height: 100dvh`.
- `viewport-fit=cover` + `env(safe-area-inset-*)` padding.
- Dynamic `<meta name="theme-color">` that follows the current page header colour, as Spotify tints the status bar.
- `@media (hover: hover)` gates every hover-only affordance; touch targets ≥ 44px; `overscroll-behavior: contain` on scrollers; body scroll-lock while a sheet is open.
- New `useIsMobile()` (`matchMedia('(max-width: 767px)')`) for *behaviour* differences. **Chrome** is CSS-gated (`md:hidden` / `hidden md:flex`), so the static HTML shows no wrong-layout flash. Mobile chrome gets `m-` testids to avoid duplicates.
- `CenterStage` becomes the full-bleed page scroller on mobile (no radius or gutters). The view components get mobile variants via Tailwind breakpoints, so there's no duplicate view code.

### 3.2 Global mobile chrome (new `src/components/mobile/*`)
| Spotify mobile element | Spec | Portfolio mapping |
|---|---|---|
| **Bottom tab bar** | ~64px + safe area; background `linear-gradient(transparent, rgba(0,0,0,.9) 40%)`; 4 tabs; 24px icon + 10px label; active = white filled icon, inactive = `#b3b3b3` outline | **Home** · **Search** (Browse + AI) · **Your Library** · **Contact** (in place of Spotify's Premium/Create tab) |
| **Mini-player** | Floats 8px above the tab bar, 8px side margins, 56px tall, 6px radius; background = `deepTone(currentTrack.coverColor, .3)`; 40px art (4px radius); title 14px bold + subtitle 12px `#b3b3b3`; right side: devices, +/✓ save, 24px play/pause; 2px progress line along the bottom edge (white on `rgba(255,255,255,.3)`) | Current track; tap → full player; **swipe left/right → next/previous** (pointer events, 60px threshold); hidden while the full player is open |
| **Full-screen Now Playing** | Slides up over 300ms with `ease-spotify`; background `linear-gradient(deepTone(color,.35), #121212)`; header: chevron-down · "PLAYING FROM PLAYLIST" (11px, tracking) + playlist name (13px bold) · "…"; artwork full width minus 48px, 8px radius; title 22px bold + subtitle 16px + save on the right; scrubber with the knob **always visible** and 11px times; controls: shuffle · prev 32px · **64px white play** · next 32px · repeat; bottom row: devices (left), share + queue (right) | Scrolling down reveals the **existing inspector cards** (Highlights → "Lyrics preview", About, Credits, Next in queue), extracted from `NowPlayingInspector.tsx` into a shared `NowPlayingCards` component. **Swipe down ≥ 120px or a fast fling closes it** |
| **Mobile lyrics** | Tapping the lyrics-preview card opens full-screen lyrics in the track tone, 22–24px bold lines, the same three line states, with a compact transport pinned to the bottom | Reuses `LyricsModeView` with a `compact` variant |
| **Bottom sheet** (replaces context menus and dialogs) | Background `#282828`, 12px top radius, 36×4px drag handle, header (48px art + title + subtitle), 56px rows with 24px icons on the left, a "Cancel"-style dismiss, swipe down to close | `ContextMenu` renders as a sheet when `useIsMobile()`; `Dialog` renders as a full-height sheet (Send Mix, Accent colour). Keyboard shortcuts are hidden on touch |
| **Toast** | Above the mini-player, full width minus 16px | Same `Toast` with mobile positioning |
| **Back behaviour** | The Android / iOS back gesture closes the sheet or player first, then goes back a page | `useUrlSync` moves from `replaceState` to **`pushState` + `popstate`** for page navigation (the in-app history mirrors browser history). The full player and sheets push a lightweight `{ overlay: true }` state so Back closes them. The desktop ‹ › arrows call `history.back()` / `history.forward()`, keeping one source of truth. Existing history unit tests are updated accordingly |

### 3.3 Screen-by-screen mapping
| Screen | Spotify mobile | Portfolio implementation |
|---|---|---|
| **Home** | Top row: 32px avatar (opens the side drawer) + filter chips; a **2-column grid of compact shortcut cards** (56px tall, `rgba(255,255,255,.1)`, 4px radius, 56px art flush left, 13px bold title); then horizontal **snap-scroll shelves** (150px cards, 22px bold section titles) | Avatar → **profile drawer**. Chips: **All · Projects · Experience · Education**, which filter the shelves. Shortcut grid: Recruiter Mix, Featured Projects, Work Experience, Konvex, Education, Certifications, plus 2 recently played (tracked in the store). Then: profile header card (photo, name, tagline, Book a call), Top artists (tech, circular), Top tracks (4 rows), Public Playlists, Following (recommenders). Horizontal shelves use `scroll-snap-type: x mandatory` |
| **Profile drawer** (Spotify's slide-in side menu) | Slides from the left at 85% width: avatar + name + "View profile", then a list | View profile · What's New · Accent colour · **Standard resume view** (the escape hatch) · Download resume (PDF) · GitHub · LinkedIn |
| **Search tab** | "Search" 24px bold title; a white 48px search field with a black placeholder ("What do you want to listen to?"), 6px radius; "Browse all" in a **2-column grid** of colour tiles (6px radius, ~100px tall, 16px bold title top-left, rotated art bottom-right). Focusing the field shows a recent-searches list; typing shows results | The field reads "What do you want to know?". Focused and empty: **suggested questions** (starter prompts). Typing: an "Ask Ibrahim's AI" row plus matching items and playlists (logic reused from `AISearchDropdown.tsx`). Asking: a **full-screen chat thread** with the input pinned above the keyboard (`visualViewport` resize listener). The Browse grid reuses `BrowseView` in a 2-column variant |
| **Your Library tab** | Header: avatar + "Your Library" 24px bold + search + "+"; chips (Playlists / Artists…); "Recents" sort + grid/list toggle; 64px-art rows; pinned item at the top with a green pin | New view `library`. Chips: **Playlists · Stack · Endorsements**. Rows reuse the `LeftSidebar.tsx` row logic (extracted into a `LibraryRow` component); search and sort reused; the grid toggle shows 3-column covers |
| **Contact tab** | (Spotify's Premium tab is a single CTA page; we reuse the layout) | New view `contact`: hero card with the photo, a "Book a call" green pill, "Send your Recruiter Mix" (opens the sheet), and contact rows (Email, Phone, GitHub, LinkedIn, Location) with tap actions as on desktop |
| **Playlist page** | Floating back chevron (top left); centred art at ~60% of the width with a shadow over a colour gradient; 24px bold title left-aligned; owner avatar + name; meta line; action row: + · download · … on the left, **shuffle + big green play on the right**; rows: no index, 48px art, 16px title, 14px subtitle, "…" on the right; **tap plays**, long-press opens the sheet. Sticky top bar: the colour fills and the title fades in, with the play button pinned to the top right | `PlaylistTableView` mobile variant. `TrackList` gets a `variant="mobile"`: single tap = `setCurrentTrack(track, true, contextId)` (Spotify mobile behaviour), long-press 500ms / "…" = sheet, save via the sheet. No column header, no hover controls. `StickyTopBar` mobile variant |
| **Profile / Recommender page** | Artist-style full-bleed header: square image, gradient, 48px name bottom-left, "monthly listeners"-style meta; Follow pill + … ; shuffle + play on the right; "Popular" numbered list | Home profile and `RecommenderProfileView` get this header on mobile (photo or initials). The recommender letter becomes an "About" card that expands on tap ("…see more" after 4 lines) |
| **Friend Activity** | Not in the mobile app | Surfaced as the Library "Endorsements" chip and the Home "Following" shelf |
| **Desktop top-bar items** | — | History arrows → browser back. Bell → drawer "What's New". Escape hatch → drawer + Contact tab. Fullscreen and devices → removed on mobile (devices shown only in the full player, as Spotify does) |

### 3.4 Store and route additions
- `ActiveViewType`: add `library`, `contact`, `search`. Hashes: `#/library`, `#/contact`, `#/search` (Browse moves to the Search tab). Update `src/lib/routing.ts`.
- Store (`src/stores/usePortfolioStore.ts`): `isFullPlayerOpen`, `isProfileDrawerOpen`, `recentlyPlayed: string[]` (last 8, persisted), `homeFilter`. Reuse the existing `closeTopmostOverlay` ordering, extended with the player and drawer.

---

## Phase 4 · Production lockdown (static export)
- `next.config.mjs` (production phase): `output: 'export'`, `trailingSlash: true` (`/resume/index.html` works on every host), `images.unoptimized`, `productionBrowserSourceMaps: false`, optional `basePath` from `NEXT_PUBLIC_BASE_PATH` (for GitHub Pages project sites).
- Delete `src/app/api/send-mix/route.ts`. `SendMixModal` already delivers through `mailto:`; remove its `fetch`.
- Escape `<` as `<` in the JSON inlined by the `layout.tsx` theme boot script, and compute its sha256 for the CSP.
- Host configs for forkers: `vercel.json`, `public/_headers` (Netlify / Cloudflare Pages), and GitHub Pages notes. Headers:
  - CSP: `default-src 'self'; script-src 'self' 'sha256-<boot>'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'`
  - HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, mic and geolocation off)
- `package.json` scripts:
  - `dev` → `next dev -H 127.0.0.1`
  - `build` → `npm run content:validate && next build && node scripts/verify-build.mjs`
  - `preview` → serve `out/`
  - `content:validate`, `content:reset`
- Playwright: the desktop and mobile projects run against `serve out`; a separate `dashboard` project runs against the dev server.

---

## Phase 5 · Security audit (after Phases 1–4; report written to `docs/improvements/10-security-audit.md`)

**Threat model:** the production site is static, so the live data can only change through (a) a commit to your repo, (b) your hosting account, or (c) your DNS. Forks only change the fork. The audit proves there is no fourth path and hardens a–c.

| # | Area | Checks (each a pass/fail with evidence) |
|---|---|---|
| A | **Build artifacts** | `scripts/verify-build.mjs` fails the build if `out/` contains `dashboard`, `__dashboard`, `route.dev`, `writeFile`, `content/.backups`, source maps, or anything under `api/`. CI runs it. A manual `curl` of `/dashboard`, `/api/__dashboard/content` (GET and PUT) and `/api/send-mix` on the live URL returns 404 |
| B | **Dev server** | Write calls with a bad `Host` (DNS rebinding), a foreign `Origin`, a missing custom header, `text/plain` (simple-request CSRF), or production `NODE_ENV` are all rejected (unit tests on `guard.dev.ts`). Bind check: unreachable from the LAN IP |
| C | **File handling** | Path traversal (`../`, absolute paths, encoded `%2e%2e`) in upload and backup names; upload magic-byte vs extension mismatch; SVG and HTML disguised as images; size limit; atomic write and backup verified |
| D | **Content injection (XSS)** | `javascript:`, `data:` and `vbscript:` URLs rejected by `safeUrl` (tests); grep confirms no `dangerouslySetInnerHTML` other than the escaped boot script; a `</script>` payload in a theme name stays inert; `mailto` subject/body encoding; every `window.open` uses `noopener,noreferrer` |
| E | **Headers / CSP** | Check the deployed headers with `curl -I`; confirm the CSP blocks inline scripts other than the hashed boot script (browser console check); clickjacking is blocked by `frame-ancestors` |
| F | **Supply chain** | `npm audit --omit=dev` clean; lockfile committed, `npm ci` in CI; Dependabot (npm + GitHub Actions); CodeQL workflow; Actions pinned to SHAs with `permissions: contents: read` |
| G | **Secrets** | `gitleaks` over the repo before the first public push; `.gitignore` covers `.env*`, `content/.backups/`, `.next`, `out` |
| H | **Repo and deploy governance** ("no one else can ever change the data") | Branch protection on `main` (no force-push, PR required, CODEOWNERS for `content/**` and `next.config.mjs`); 2FA on GitHub and the host; production deploys only from `main`; PR preview deploys from forks disabled or not on the production domain; DNS registrar lock |
| I | **Privacy (open source)** | Review the personal data published in `portfolio.json` (phone, faculty emails): confirm consent, or obfuscate; the example template contains no real personal data |
| J | **Licensing** | No proprietary fonts or Spotify assets in the repo (`git ls-files public/fonts`); third-party licences present |
| K | **Optional DAST** | OWASP ZAP baseline scan against the preview deployment |

Each finding is recorded with a severity, a fix and a re-test; the audit is complete only when A, B, D and H all pass.

---

## Phase 6 · Open-source packaging
- README sections: what it is, demo, **"Make it yours in 5 minutes"** (fork → `npm ci` → `npm run dev` → `/dashboard` → edit → commit → deploy to Vercel, Netlify or Pages), architecture links, disclaimers.
- `content/portfolio.example.json` uses neutral sample data; `CONTRIBUTING.md`; `SECURITY.md` (how to report issues; states that the dashboard is dev-only by design).
- Docs: `docs/improvements/11-mobile-spec.md` (the tables above as built), `12-dashboard-guide.md`.

---

## Critical files
- **Modified:**
  - Data and types: `src/data/portfolioData.ts`, `src/types/portfolio.ts`
  - Logic and state: `src/lib/aiEngine.ts`, `src/lib/routing.ts`, `src/lib/hooks.ts` (`useUrlSync` → pushState), `src/stores/usePortfolioStore.ts`
  - App and config: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/app/resume/page.tsx`, `next.config.mjs`, `package.json`, `playwright.config.ts`
  - Components: `CoverArt.tsx`, `ContextMenu.tsx`, `Dialog.tsx`, `TrackList.tsx`, `StickyTopBar.tsx`, `PlaylistTableView.tsx`, `HomeProfileView.tsx`, `RecommenderProfileView.tsx`, `LyricsModeView.tsx`, `BrowseView.tsx`, `NowPlayingInspector.tsx`, `LeftSidebar.tsx`, `TopNavBar.tsx`, `SendMixModal.tsx`
- **New:**
  - `content/*.json`, `src/content/schema.ts`
  - Mobile: `src/components/mobile/{BottomTabBar,MiniPlayer,FullPlayer,BottomSheet,ProfileDrawer,LibraryView,ContactView,SearchView,NowPlayingCards}.tsx`
  - Dashboard: `src/app/dashboard/*.dev.tsx`, `src/app/api/__dashboard/**/route.dev.ts`, `src/components/dashboard/*`
  - Scripts and hosting: `scripts/{content-validate,content-reset,verify-build}.mjs`, `vercel.json`, `public/_headers`, `.github/workflows/{ci,codeql}.yml`, `.github/dependabot.yml`
  - Repo docs: `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`
- **Deleted:** `src/app/api/send-mix/route.ts`, `public/fonts/circular-*.woff2`
- **Reused, not rewritten:** `resolvePlaylist` / `computeQueue` / `deepTone` / `trackMenuItems` / `spotifyButtonClasses`, plus the existing `Slider`, `PlayButton`, `Shelf`, `MediaCard`, `IconButton`, `Tooltip`, `Toast` and `Dialog`.

## Verification
1. **Unit (Vitest):**
   - All 47 existing tests stay green; the aiEngine tests act as the parity check for the JSON move.
   - New tests: schema (valid file, broken reference, `javascript:` URL, duplicate ids), loader re-exports, the `guard.dev.ts` matrix, upload validation (magic bytes, traversal, SVG), atomic write and backup, mobile `TrackList` tap-plays / long-press-sheet, pushState history, overlay Back ordering.
2. **E2E (Playwright):**
   - Desktop project (the existing 8).
   - **Mobile projects** (`devices['Pixel 7']`, `devices['iPhone 14']`): tab navigation; mini-player → full player → swipe down; tap a row to play; long-press sheet; Search → ask the AI; Library chips; Contact → Send Mix sheet; Back closes the sheet, then goes back a page; no horizontal scroll at 360px.
   - **Dashboard project** (dev server): edit a track title → save → the preview iframe shows it; add and delete with a reference warning; upload an image → it renders in `CoverArt`; an invalid URL blocks Save; restore a backup.
3. **Build lockdown:** `npm run build` produces `out/`; `verify-build.mjs` passes; `npx serve out` then `curl` `/dashboard` and `/api/__dashboard/content` both return 404; check the headers on a preview deploy.
4. **Manual:** a real phone over a preview URL (safe-area, keyboard and chat, swipe gestures, status-bar tint); Lighthouse mobile ≥ 90 performance and ≥ 95 accessibility.
5. **Security audit:** execute the Phase 5 checklist and write `10-security-audit.md` with evidence per check.
