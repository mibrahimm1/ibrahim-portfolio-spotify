# 01 · Codebase Analysis (state before this pass)

This is a walkthrough of every file as it existed **before** the refinement, written so that someone new to the project can understand what each piece did, how the pieces talked to each other, and where the weak points were. Line numbers refer to the original files.

---

## 1. Stack and tooling

| File | Role | Notes |
|------|------|-------|
| `package.json` | Next.js 15 (App Router), React 18.3, Zustand 5, Tailwind 3.4, `clsx` + `tailwind-merge`, Vitest 2 + Testing Library + jsdom, Playwright 1.64 | `lucide-react` was a dependency but **never imported**. There was no ESLint config, so `next lint` had nothing to enforce. |
| `next.config.mjs` | `reactStrictMode`, and `images.remotePatterns: [{ hostname: '**' }]` | No `next/image` was used anywhere. The wildcard allowed the image optimizer to proxy **any host on the internet**, an unnecessary attack surface. |
| `tsconfig.json` | Strict TS, `@/*` → `src/*` alias | `tests/` excluded from the app compile (Vitest compiles tests on its own). |
| `tailwind.config.ts` | Spotify palette scales (`green`, `dark`, `neutral`, `overlay`, `decorative`), Circular font stack, `spot-1…4` radii, one shadow | No keyframes/animations, even though components used `animate-fade-in` and `animate-scale-up`. No `scale-102`/`scale-106`, `backdrop-blur-xs` or `shadow-xs` (not in Tailwind v3). All of those classes silently produced nothing. |
| `postcss.config.js` | Tailwind + autoprefixer | Standard. |
| `vitest.config.ts` | jsdom, globals, `tests/setup.ts`, `@` alias | Standard. |
| `playwright.config.ts` | Chromium only, `webServer: npm run start` on :3000 with `reuseExistingServer` | E2E runs against a production build unless a dev server is already up. |
| `public/fonts/circular-*.woff2` | Five Circular weights | These are Spotify's proprietary typeface files. See [09](09-limitations-and-next-steps.md) for licensing. |
| `public/resume.pdf` | Downloadable resume | Referenced from three places with duplicated download code. |

## 2. App shell — `src/app`

### `layout.tsx`
Root layout: SEO metadata (title, description, keywords, author), viewport, preloads for the Book (400) and Bold (700) font files, and `<body class="bg-black text-white antialiased font-spotify">`. There was no favicon (the browser requested `/favicon.ico` and got a 404) and no `themeColor`.

### `globals.css`
- Lines 5–84: ten `@font-face` rules registering the same five files under two family names (`Circular Spotify`, `Circular Spotify Text`).
- Lines 86–112: CSS variables for the swappable accent (`--accent-primary/hover/pressed`, `--banner-gradient`), a universal margin/padding reset, and body rules: black background, `user-select: none`, `overflow: hidden`, `height: 100vh`, `min-width: 1024px`.
- Lines 114–135: a global 14px WebKit scrollbar with a rounded translucent thumb, always visible. Spotify's overlay scrollbar is hidden until you hover the scroll container.
- Lines 137–152: `pulse-dot` keyframes, used by the lyrics header.
- Lines 154–161: `.spotify-transition` / `.spotify-hover-card` helpers with Spotify's `cubic-bezier(0.3, 0, 0, 1)` easing.
- Lines 163–200: `.spotify-scrubber`, which styles a native `<input type=range>` thumb that appears on hover.
- Lines 202–219: print stylesheet for the resume page.

Important side effect: `body { overflow: hidden; height: 100vh }` applied to **every route**, including `/resume`, whose content is taller than the viewport, so **the resume page could not scroll**.

### `page.tsx` (client component)
Composed the five zones (TopNavBar, LeftSidebar, CenterStage, RightSidebar, BottomPlayerBar) plus four overlays (AISearchDropdown, SendMixModal, ThemeSwitcherModal, Toast), and called `hydrateFromStorage()` once on mount.

### `resume/page.tsx`
A clean, printable, ATS-friendly resume generated from the same `portfolioData` (profile, experience, top five projects, education, publication, certifications, recommenders). Its `handleDownload` was a copy of the download code in two other components. The DOI link text was hard-coded rather than read from the data.

### `api/send-mix/route.ts`
`POST` handler that `console.log`ged the recruiter's email, name and company and returned `{ success: true }`. It did no validation, so bad JSON returned 500. It logged personal data. It sent nothing anywhere: the comment says "In production … send via Resend", but nothing did.

## 3. Types — `src/types/portfolio.ts`
Domain model, borrowing music vocabulary:

- **`Track`**: one portfolio item (project, role, degree, paper, award). `title`/`subtitle` act as song and artist; `album` is the category; `dateAdded` is the timeline; `duration` is reused for a domain tag such as "Agentic Commerce" or "CGPA: 3.59"; `hook` is the headline metric; `details` is the narrative; `credits[]` lists the tech stack with roles; plus optional `externalUrl`, `demoUrl`, `recommenderId`, and a decorative `coverColor`.
- **`Playlist`**: a portfolio section with `tracks[]`.
- **`Recommender`**: a faculty endorser with full letter paragraphs, competencies and a linked track.
- **`AccentTheme`**, **`ChatMessage`**, **`StarterPrompt`**, **`ActiveViewType`** (`home | playlist | recommender | lyrics | recruiter-mix`).

## 4. Data — `src/data/portfolioData.ts` (807 lines)
The single source of truth for all content:

- `candidateProfile`: name, role, tagline, contact details, bio, and `calendarBookingUrl`, which was still a placeholder (`https://calendar.google.com/`).
- `technologyAvatars` (8): "Top artists" tiles with decorative colours.
- Track arrays: `featuredProjectsTracks` (8), `workExperienceTracks` (4), `educationTracks` (3), `publicationTracks` (1), `volunteeringTracks` (4), `certificationsTracks` (7).
- `allPlaylists` (7): index 0 is the virtual, initially empty **Your Recruiter Mix**; the rest wrap the arrays above.
- `recommenders` (2): full letters and competencies.
- `starterPrompts` (5): canned questions with first-person answers.
- `accentThemes` (5): green, purple, orange, crimson, blue.
- `coverLetterStanzas` (6): paragraphs for Lyrics mode.

## 5. State — `src/stores/usePortfolioStore.ts` (Zustand)
One store holds everything:

- **Playback:** `currentTrack`, `currentPlaylist`, `isPlaying`, `progress` (0–100), `currentTimeSeconds`, `durationSeconds = 30`. A silent 30-second "highlight timer" stands in for audio (constraint CON-02).
- **Library:** `recruiterMix: string[]` (bookmarked track ids), persisted to `localStorage` key `ibrahim_recruiter_mix`.
- **Theme:** `activeAccentTheme`, persisted to `ibrahim_accent_theme`. `setAccentTheme` and `hydrateFromStorage` both wrote CSS variables onto `<html>`.
- **Navigation:** `activeView`, `activePlaylistId`, `activeRecommenderId`, plus an in-memory `history[]` / `historyIndex` stack for the top-bar arrows.
- **Layout:** `isRightSidebarOpen`, `rightSidebarMode` (`inspector | activity`), `isLibraryCollapsed`, `isSearchOpen`, `isBookingModalOpen`, `isThemeModalOpen`, `toastMessage`.

Notable original behaviours, each covered in [03](03-bugs-found-and-fixed.md):

- `setCurrentTrack` always re-parented the track to its **original** playlist, so playing from the Recruiter Mix moved the queue to another playlist.
- `navigateToRecruiterMix` stored no `playlistId` in history, so `navigateBack/Forward` restored `activePlaylistId = 'featured-projects'` while `activeView = 'recruiter-mix'`.
- Every navigation pushed a history entry, even when re-opening the current view.
- `showToast` cleared the toast after 2.8s **if the text still matched**, so a repeated identical toast was cut short by the earlier timer.
- `hydrateFromStorage` trusted `JSON.parse` output blindly and kept stale ids.

## 6. Logic — `src/lib`

- **`utils.ts`:** `cn()` (clsx + tailwind-merge) and `formatSecondsToTime()`.
- **`aiEngine.ts`:** a deterministic keyword router standing in for an LLM. It first matches a starter prompt by its first 20 characters, then checks twelve keyword groups (cost/BizBuddy, Konvex, Horquva, medical, hackathon, RAG, education, recommenders, contact, IoT, brain tumour), and falls back to a default bio. It used `String.includes`, so `"rag"` matched *storage/average/drag*, `"sam"` matched *same/sample*, and `"call"` matched *recall*.

## 7. Components (before)

### Shell
- **`TopNavBar.tsx`:** 54px bar with three macOS "traffic-light" dots (decorative; Spotify on Windows shows none), back/forward buttons rendered as text glyphs `‹ ›`, a 40px Home button, a 46px search pill whose input **did nothing when you typed** (it only opened the separate modal, which had its own input), a `Ctrl+L` kbd badge, a bell that wasn't a button, the Friends toggle, an "I" avatar and the minimise escape hatch with a CSS hover tooltip. It registered its own `keydown` listener for Ctrl+L/K and Escape.
- **`LeftSidebar.tsx`:** "Your Library" header, a "+ Contact" pill, a `«` collapse glyph, contact chips (GitHub, LinkedIn, `Email ✉`, phone, location) in a row using the **undefined** `no-scrollbar` class (a scrollbar showed under the chips), and the playlist list with 48px letter tiles. Clipboard writes weren't awaited or caught. The Recruiter Mix showed a green count badge and the emoji 📌/💜.
- **`RightSidebar.tsx`:** switched between `NowPlayingInspector` and `ListeningActivity`; used the undefined `animate-fade-in`.
- **`BottomPlayerBar.tsx`:** 77px bar subscribing to the **entire store** (`usePortfolioStore()` with no selector), so it re-rendered on every change, including the once-a-second timer tick. It owned both the 1s `setInterval` and a global Space listener. Problems:
  - **Shuffle called `nextTrack()`.**
  - Repeat did nothing.
  - The volume bar was a `defaultValue` range with a hard-coded 75% fill, purely decorative.
  - PiP, Devices and Fullscreen did nothing.
  - The Space handler toggled playback even when a **button** had focus, so Space on a focused button fired twice.
  - The scrubber was a transparent native range laid over a div, so the thumb and the fill didn't line up and there was no drag feedback.

### Stage
- **`CenterStage.tsx`:** chose the view and smooth-scrolled to top on change (Spotify jumps instantly). When the right sidebar was closed it drew a floating "expand" chevron, which Spotify doesn't have.
- **`HomeProfileView.tsx`:**
  - Hero: 260px banner using `--banner-gradient`, a 192px "MIS" circle and a 7xl name that wrapped onto three lines and overflowed.
  - Action bar: a gear, "📅 Book an Interview / Call" (which **wrapped onto two lines**) and "Download Resume (PDF)".
  - "Top artists": an 8-column grid of tiny circles, all opening Featured Projects.
  - "Public Playlists": a 7-column grid of cramped cards, each with an "N items" footer.
- **`PlaylistTableView.tsx`:**
  - Header and action bar, then a flex-based "table" whose header widths and row widths came from separate `w-64`/`w-36` classes.
  - Header labels in uppercase, 2018-Spotify style.
  - A static "Compact List View • 4 Columns" caption that did nothing.
  - Single click on a row played it.
  - "Updated October 2026" was hard-coded.
  - `isRecruiterMix` was derived from `activePlaylistId`, which is the root of the back/forward bug.
- **`RecommenderProfileView.tsx`:** blue banner, bordered avatar, `<a><button/></a>` nesting (invalid HTML), "★" badges and a letter card.
- **`LyricsModeView.tsx`:** `#242424` canvas with 30%-white inactive stanzas and an "Exit Lyrics" button. The **active stanza advanced every 5 seconds** (6 stanzas over the 30s timer), far too fast to read ~60-word paragraphs. It used the undefined `scale-102`.

### Inspector / activity
- **`NowPlayingInspector.tsx`:** header with an "Endorsements 👥" text button, letter-tile art, title, the **always-red** "Headline Metric Hook" card, an About card, a Credits card, and a **"Next in queue" card that showed the external link, not the next track**.
- **`ListeningActivity.tsx`:** bordered cards per recommender, using emoji.

### Modals
- **`AISearchDropdown.tsx`:** a full-screen dimmed overlay with a centred 540px box, its own input, starter prompts and the chat thread. The "Inspect Project" chip **closed the modal without loading the track**. It used the undefined `animate-scale-up`.
- **`SendMixModal.tsx`:** the Edit-details-style form. On submit it `await`ed `fetch('/api/send-mix')`, **built a `mailto:` URL and never used it**, then called `window.open(calendar)`. That call came after the `await`, outside the click's user-activation window, so popup blockers could stop it. The recruiter's message therefore **reached nobody**. The pre-fill effect depended on `recruiterMix` but read a non-memoised derived array.
- **`ThemeSwitcherModal.tsx`:** five swatches.

Escape only closed the search modal. Dialogs had no focus management.

### Common
- **`Icons.tsx`:** about 30 icons, mostly Feather-style 2px *stroked* outlines (Spotify uses solid 16px glyphs).
- **`SpotifyButton.tsx`:** primary/secondary/pill/circle variants. Labels could wrap. It used `active:scale-95`; Spotify doesn't scale down on press.
- **`Toast.tsx`:** green pill with `animate-bounce`.

## 8. Tests (before)
- **Unit (22):** AI engine routing (8), store basics (5), the AISearchDropdown starter flow (2), LeftSidebar rendering and navigation (3), and TopNavBar controls (4).
- **E2E (6):** five zones render, bookmark and modal, AI popover, theme swap, escape hatch, lyrics.

All passed, but they didn't cover any of the bugs above.
