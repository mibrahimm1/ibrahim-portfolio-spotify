# 03 · Bugs Found and Fixed

Each entry gives the **symptom**, the **root cause** (with the original location), the **fix**, and the **test** that now guards it. Severity: 🔴 broken user-facing behaviour · 🟠 noticeable defect · 🟡 minor or latent.

## Functional

### 🔴 1. The Send Mix form never delivered the recruiter's message
- **Symptom:** A recruiter fills in the form and clicks "Send & Book Call". A toast says "submitted", but the message reaches nobody.
- **Cause:** `SendMixModal.tsx` ~L70–75 built a `mailto:` URL into `mailtoUrl` and **never used it**. The API route only `console.log`ged.
- **Fix:** The message now goes through the visitor's own mail client (`mailto:` with subject and body), and the API call is a non-blocking `keepalive` log.
- **Test:** Manual; E2E-02 covers opening the modal and the pre-fill.

### 🔴 2. The Google Calendar tab could be popup-blocked
- **Cause:** `window.open()` ran after `await fetch(...)`, outside the click's transient user activation.
- **Fix:** The booking tab opens synchronously as the first statement in the submit handler.

### 🔴 3. Back/Forward into Recruiter Mix showed Featured Projects
- **Cause:** `navigateToRecruiterMix` stored `{ view: 'recruiter-mix' }` without a `playlistId`. `navigateBack/Forward` then set `activePlaylistId = prev.playlistId || 'featured-projects'`, and `PlaylistTableView` decided "is this the mix?" from `activePlaylistId`.
- **Fix:** The entry stores `playlistId: 'recruiter-mix'`; a missing id keeps the current value instead of a hard-coded fallback; the view keys off `activeView`.
- **Test:** `playback.test.ts › restores the Recruiter Mix…`

### 🔴 4. The AI "Inspect Project" chip didn't load the project
- **Cause:** `AISearchDropdown.tsx` ~L184 closed the modal and set the sidebar mode, but never set the track.
- **Fix:** `openTrackDetails(track)` loads the track and opens the inspector.
- **Test:** Verified in the browser.

### 🔴 5. The `/resume` page couldn't scroll
- **Cause:** `body { overflow: hidden; height: 100vh }` is global; the resume container was `min-h-screen` without its own scroll.
- **Fix:** The container is `h-screen overflow-y-auto`, reset for print.

### 🔴 6. Shuffle didn't shuffle
- **Cause:** The player bar's shuffle button called `nextTrack()`. The playlist shuffle button just played a random track.
- **Fix:** Real shuffle state with a generated order (current track first). The queue, Next and Previous all respect it, and it's persisted.
- **Test:** `playback.test.ts › shuffle builds an order…`

### 🟠 7. Repeat did nothing
- **Fix:** Three states (off → context → track) with Spotify's end-of-context behaviour: repeat off rewinds to the first track and stops, context loops, track restarts.
- **Test:** `playback.test.ts › stops at the end… / repeat-one… / cycles repeat…`

### 🟠 8. Playing from the Recruiter Mix moved the queue to another playlist
- **Cause:** `setCurrentTrack` always set `currentPlaylist` to the track's original playlist.
- **Fix:** A `playContextId` is passed by the caller (any playlist, the Recruiter Mix or a tech playlist). The queue is resolved live from that context, so newly saved items join the queue.
- **Test:** `playback.test.ts › keeps the queue inside the context…`

### 🟠 9. "Next in queue" showed an external link, not the next item
- **Fix:** It shows `computeQueue(state)[0]` (shuffle and repeat aware) and plays it on click.

### 🟠 10. Previous always went back a track
- **Fix:** Matches Spotify: more than 3s into a track, Previous restarts it.
- **Test:** `playback.test.ts › previous restarts…`

### 🟠 11. Space fired twice on focused buttons
- **Cause:** The global Space handler only skipped inputs. Space on a focused button natively clicked it *and* toggled playback.
- **Fix:** A single shortcut hook skips buttons, links, sliders, menu items and editable fields.
- **Test:** E2E-08.

### 🟠 12. Escape only closed search
- **Fix:** `closeTopmostOverlay()` closes one layer at a time (context menu → shortcuts → theme → Send Mix → search → lyrics), meeting NFR-A11Y-02.
- **Test:** `playback.test.ts › Escape closes the innermost overlay first`

### 🟠 13. Friends toggle did nothing while the sidebar was hidden
- **Fix:** Switching panel mode re-opens the sidebar.
- **Test:** `playback.test.ts › switching to Friend Activity…`

### 🟠 14. Lyrics advanced every 5 seconds
- **Cause:** Six ~60-word stanzas mapped evenly onto the 30s timer.
- **Fix:** The lyrics view runs its own timeline (`LYRICS_DURATION_SECONDS` at ~3 words per second, 86s with the current text), and stanza boundaries are weighted by word count. Leaving lyrics restores the 30s timer at the same progress fraction.
- **Test:** `playback.test.ts › toggling lyrics…`, `catalog.test.ts › weights stanza start points…`

### 🟠 15. Mic button always exited lyrics to Home
- **Fix:** `toggleLyrics()` returns to the previous view.

### 🟠 16. Typing in the top-bar search did nothing
- **Fix:** The top-bar input is the search box. Typing shows live results plus an "Ask Ibrahim's AI" row; Enter asks. The dropdown's duplicate input was removed.

### 🟡 17. History filled with duplicates
- **Fix:** Navigating to the current view doesn't push an entry.
- **Test:** `playback.test.ts › does not push duplicate entries…`

### 🟡 18. Repeated toasts were cut short
- **Cause:** The timeout cleared the toast if `toastMessage === msg`, so the earlier timer of an identical message fired early.
- **Fix:** Toasts carry an incrementing id.

### 🟡 19. Unvalidated storage
- **Fix:** Bookmarks are filtered to ids that still exist; prefs are type-checked and clamped.

### 🟡 20. Clipboard promise rejections were unhandled
- **Fix:** `copyToClipboard()` awaits and shows a failure toast.

### 🟡 21. AI keyword false positives
- **Cause:** `includes('rag')` matched "storage", `includes('sam')` matched "same", `includes('call')` matched "recall".
- **Fix:** Word-start regex matching; `sam` → `sam 2`/`sam2`.
- **Test:** `catalog.test.ts › AI keyword matching`

## Rendering and performance

### 🟠 22. The whole app re-rendered every second
- **Cause:** Components called `usePortfolioStore()` with no selector, subscribing to everything, including the 1Hz timer tick.
- **Fix:** Every component uses narrow selectors or `useShallow`. The timer moved to a `usePlaybackTimer` hook at the page level. Sticky headers read scroll position through `useStageScroll`, so only they re-render on scroll.

### 🟠 23. Classes that didn't exist
- **Cause:** `animate-fade-in`, `animate-scale-up`, `scale-102`, `hover:scale-106`, `backdrop-blur-xs`, `shadow-xs` and `.no-scrollbar` were used but never defined.
- **Fix:** Keyframes and animations were added to the Tailwind config, `.no-scrollbar` to the CSS, and the rest replaced.

### 🟡 24. Theme flash on load
- **Cause:** The saved accent was applied in a `useEffect`, after first paint.
- **Fix:** A tiny inline boot script in `layout.tsx` (generated from `accentThemes`) sets the CSS variables before paint, with `suppressHydrationWarning` on `<html>`.

## Found during this pass (introduced and fixed before shipping)

### 🔴 25. Infinite render loop in the Queue panel
- **Cause:** The selector returned `{ ..., queue: computeQueue(s) }` through `useShallow`, but a fresh array nested in an object is never shallow-equal.
- **Fix:** The queue is selected on its own with `useShallow(computeQueue)`, which compares arrays element by element.
- **How it was caught:** browser verification.

### 🟠 26. A colour token clashed with a font size
- **Cause:** Naming a colour `base` made `text-base` set **both** 16px and `color: #121212` (dark text).
- **Fix:** Renamed to `surface`, with a comment explaining why.

### 🟠 27. Outline buttons lost their border
- **Cause:** A `button { border: 0 }` reset also set `border-style: none`, which beat Tailwind's width-only `.border`.
- **Fix:** Removed the reset; Tailwind's preflight already handles buttons.

### 🟡 28. The hidden sticky play button caught clicks
- **Cause:** Its `pointer-events-auto` stayed on while it was at opacity 0.
- **Fix:** Pointer events and `aria-hidden` now follow visibility.

## Security and hygiene

### 🟡 29. Wildcard remote image pattern
- **Cause:** `images.remotePatterns: [{ hostname: '**' }]` let `/_next/image` fetch from any host.
- **Fix:** Removed (no remote images are used).

### 🟡 30. API route logged personal data and crashed on bad input
- **Fix:** It validates JSON and email (returns 400), caps field sizes, and logs metadata only.

### 🟡 Invalid HTML
- **Cause:** `<a><button/></a>` nesting on the Recommender page.
- **Fix:** Anchors take button styling via `spotifyButtonClasses()`.
