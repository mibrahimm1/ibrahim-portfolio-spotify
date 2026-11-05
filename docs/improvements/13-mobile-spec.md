# 13 · Mobile experience (Phase 3)

The site now adapts to three widths. Below 768px it switches from the Spotify desktop client layout to the Spotify **phone app** layout: a tab bar, a mini-player, a full-screen player, bottom sheets and a slide-in profile menu. Content, state and routes are shared; only the shell around them and some row behaviour change.

| Width | Layout |
|---|---|
| `< 768px` | Phone shell (this document) |
| `768–1023px` | Desktop shell. The library is always the 72px icon rail, and Now Playing floats over the page (closed on first load) instead of taking a column |
| `≥ 1024px` | Desktop, unchanged. Below 1240px with Now Playing open, the library folds to the rail |

## How it is built

- **Two shells, one page.** The desktop chrome (top bar, library, Now Playing, player bar) is wrapped in `hidden md:contents`. The phone chrome (`src/components/mobile/*`) is `md:hidden`. Both are in the static HTML, so a phone never flashes the desktop layout before React loads.
- **Behaviour switch.** `useIsMobile()` in `src/lib/hooks.ts` (a `useSyncExternalStore` on `(max-width: 767px)`) covers what CSS can't: tap-to-play rows, bottom sheets instead of menus, and the art size in page headers.
- **Global CSS.** The old `body { min-width: 1024px }` is gone. The page uses `100dvh`, `viewport-fit=cover` and `env(safe-area-inset-*)` padding (`.pt-safe`, `.pb-safe`), `overscroll-behavior: none`, and no tap highlight. Tailwind's `hoverOnlyWhenSupported` stops hover styles from sticking after a tap.
- **Tests.** Phone elements carry `m-` test ids so they never clash with the desktop ones.

## Global phone chrome

| Element | File | Behaviour |
|---|---|---|
| Tab bar | `mobile/BottomTabBar.tsx` | Home · Search · Your Library · Contact (Contact takes the slot Spotify uses for Premium). Dark gradient, safe-area padding. Tapping the current tab scrolls the page to the top |
| Mini-player | `mobile/MiniPlayer.tsx` | Floats above the tab bar, tinted from the track colour, with a 2px progress line. Tap opens the full player; swipe left or right (60px) skips next or previous; + saves to the Recruiter Mix |
| Full player | `mobile/FullPlayer.tsx` | Slides up. Header "Playing from playlist", large art, title and save, a scrubber with the knob always shown, then shuffle · previous · 64px play · next · repeat, and a share and queue row. Below, the same cards as the desktop Now Playing view (`inspector/NowPlayingCards.tsx`). Drag down 120px or tap the chevron to close |
| Queue | `MobileChrome.tsx` | The desktop `QueuePanel` inside a bottom sheet |
| Bottom sheet | `mobile/BottomSheet.tsx` | Portal, dimmed backdrop, drag handle, swipe down 100px to close, body scroll lock |
| Context menu | `common/ContextMenu.tsx` | On phones, every context menu becomes a sheet with a header (cover, title, subtitle) and 56px rows. Headers come from `trackMenuHeader` / `playlistMenuHeader` in `src/lib/menus.ts` |
| Dialogs | `modals/Dialog.tsx` | Send Mix, Accent colour and Shortcuts open full screen with safe-area padding |
| Profile menu | `mobile/ProfileDrawer.tsx` | Opened from the avatar. View profile, What's New, Accent colour, Standard resume view, Download resume, GitHub, LinkedIn |
| Search | `mobile/MobileSearch.tsx` | Full screen with Cancel. Uses `search/SearchBody.tsx`, the same suggestions, results and AI chat as the desktop dropdown. The input stays above the on-screen keyboard (`visualViewport`) |

## Screens

| Screen | What changes on phones |
|---|---|
| **Home** | `stage/MobileHomeTop.tsx`: avatar, then chips (All plus the first three playlists), a two-column grid of eight shortcuts (the Recruiter Mix, the playlists and up to two recently played items), then a profile card with Book a call and play. A chip swaps the rest of Home for that playlist's rows. The desktop shelves follow as snap-scroll rows of 162px cards |
| **Search** | `BrowseView` gets a "Search" title and a white field ("What do you want to know?") that opens the full-screen search, then two columns of 100px tiles |
| **Your Library** | New `LibraryView`: avatar, title, search toggle, chips (Playlists · Stack · Endorsements), list or three-column grid. The Recruiter Mix stays pinned on top |
| **Contact** | New `ContactView`: a call-to-action card (Book a call, Send your Recruiter Mix), contact rows (email, phone, GitHub, LinkedIn, location), and resume links |
| **Playlist / profile pages** | Centred art up to 62% of the width (260px max), left-aligned 32px title, the play button moved to the right of the action row, desktop-only buttons hidden, and a floating back button. Rows: 48px art, title and subtitle, "…" on the right. **One tap plays** (Spotify phone behaviour); a 500ms long press or "…" opens the sheet |
| **Lyrics** | Same view, with a floating back button |

## Routes and state

- New routes: `#/library` and `#/contact`. Browse stays at `#/search` and is the Search tab.
- New store fields: `isFullPlayerOpen`, `isProfileDrawerOpen`, `isQueueSheetOpen`, `mobileTab`, `homeFilter`, and `recentlyPlayed` (the last 8, saved with the other preferences and checked when loaded).
- New actions: `navigateToLibrary`, `navigateToContact`, `goToHistoryIndex`, plus setters for the overlays and the Home filter.
- `mobileTab` follows the root pages. A page opened from a tab keeps that tab highlighted.
- `closeTopmostOverlay` closes, in order: context menu, shortcuts, accent colour, Send Mix, queue sheet, profile menu, full player, search, lyrics.

## Back button and gesture

`useUrlSync` moved from `replaceState` to real browser history, so the Android Back button and the iOS swipe behave like the app:

- Each new page **pushes** an entry with `{ app: 1, idx }`. Back and Forward go to that index with `goToHistoryIndex`. The desktop ‹ › arrows still move the in-app history, and the browser follows with `history.go`.
- Opening an overlay (full player, profile menu, queue, dialogs; and on phones also menus and search) pushes an **overlay entry**. Back closes the top overlay instead of leaving the page. Closing it from the UI removes the entry again.
- A shared deep link keeps Home underneath it, so Back from a shared link lands on Home rather than leaving the site.
- Each write **merges into the existing `history.state`**. Next's App Router keeps its own fields there and reloads the whole page when Back lands on an entry without them. The first write happens before Next starts copying those fields itself, so without the merge, closing any dialog reloaded the page.

## Tests

- **Unit:** `tests/unit/mobile.test.tsx` (12 tests) covers:
  - the new routes
  - tab tracking and `goToHistoryIndex`
  - recently played
  - overlay close order
  - tap-to-play and long-press on phone rows
  - the history sync: push per page, Back to Home, Back closes a sheet first, closing from the UI drops the entry, and Next's fields are kept
- **E2E:** `tests/e2e/mobile.spec.ts` runs under two projects: `mobile-android` (Pixel 7) and `mobile-ios` (iPhone 14 viewport, touch and user agent, in Chromium so WebKit needn't be installed). It covers:
  - phone chrome only
  - the four tabs
  - mini-player to full player and back
  - tap to play, and the "…" sheet
  - Back closing a sheet, then going back a page
  - Search asking the AI
  - Library chips
  - Send Mix full screen, closed by Back
  - the profile menu
  - no horizontal scroll at 360px on eight pages
- **Totals at hand-off:** 124 unit tests and 32 Playwright tests (desktop 8, Android 10, iOS 10, dashboard 4), all passing.

## Fixed during verification

- At 360px the playlist action row overflowed by 16px. The pill now reads "Send mix" below 400px.
- The desktop search dropdown also mounted on phones, duplicating the results and closing the phone search on any tap. It now stays closed below 768px.
- Next's dev-tools badge covered the Home tab, so `devIndicators` is off. The dashboard's "Edit content" pill sits above the mini-player on phones.
- The history reload described above.

## Not covered

Real-device checks (safe areas on a notched phone, the keyboard with the chat open, swipe feel, status-bar tint) and a Lighthouse run need a deployed preview, so they wait for Phase 4.
