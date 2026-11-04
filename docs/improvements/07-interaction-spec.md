# 07 · Interaction Spec

## Track rows (`TrackList`)

| Input | Result |
|---|---|
| Hover | Row highlights; the index becomes ▶ (or ⏸ if this track is playing); the save (+) and "…" buttons appear |
| Click | **Selects** the row (lighter highlight). Doesn't play. |
| Double-click / Enter (row focused) | Plays the track **in this page's context** (playlist, Recruiter Mix or "This Is" list) and opens the Now Playing view |
| ▶ in the index column | Plays, or toggles if already current |
| + / ✓ | Saves to or removes from Your Recruiter Mix (toast). Doesn't select. |
| Album cell | Opens the track's home playlist |
| Right-click / "…" | Track menu: Play · Save/Remove · View details · Go to &lt;playlist&gt; · Read faculty endorsement (if any) · Open on GitHub/DOI · Open live demo · Copy link |
| Playing row | Green title, animated equalizer in place of the number |

> **Trade-off:** click-to-select / double-click-to-play is exactly Spotify, but recruiters who don't know Spotify may single-click and expect something to happen. The hover ▶, the card play buttons, search results and "View details" all give a one-click path. To make single-click play, change `onClick` in `TrackRow` to call `setCurrentTrack(track, true, contextId)` (see [09](09-limitations-and-next-steps.md)).

## Cards and shelves
- Click a card (or press Enter/Space) to open it. The green play button slides up on hover and plays that context; if the context is already playing it toggles pause.
- "Show all" expands a shelf in place ("Show less" collapses). On Home, "Top tracks → Show all" opens Featured Projects.
- Right-click a playlist card or library row to get the playlist menu: Play · Open · Send mix & book a call (Recruiter Mix only) · Download resume · Copy link.

## Player bar

| Control | Behaviour |
|---|---|
| Artwork | Shows or hides the Now Playing view; right-click opens the track menu |
| Title | Opens the track's playlist |
| + / ✓ | Save toggle |
| Shuffle | Toggles shuffle (green + dot). Turning it on builds a random order starting with the current track; it's persisted |
| Previous | Restarts the track if more than 3s have played, otherwise goes to the previous track in the context |
| Play/Pause | Toggles the silent timer |
| Next | Next in the context order. On the last track it wraps (with repeat off and auto-advance, it rewinds and **stops**) |
| Repeat | off → all (green) → one (green, "1" icon) → off |
| Progress | Drag or click to seek; arrow keys ±5%, Home/End |
| Now Playing view / Queue | Open that panel, or close it if it's already showing (green + dot when active) |
| Lyrics (mic) | Toggles the cover-letter lyrics view; leaving returns to the previous page |
| Devices | Menu: "This web browser" ✓ / Standard resume view |
| Volume | Mute toggle + slider (visual only, per CON-02); icon shows the level |
| Fullscreen | Browser fullscreen |

## Timer semantics
- Tracks run 30s. Lyrics run `LYRICS_DURATION_SECONDS` (86s with the current text).
- Repeat **one**: restart at the end. Repeat **all**: continue and wrap. Repeat **off**: at the end of the context, go back to the first track and pause.
- Saving or removing Recruiter Mix items while it's the play context updates the queue live.

## Top bar
- **•••**: app menu (Home, Browse, Accent colour…, Keyboard shortcuts, Standard resume view, Download resume).
- **‹ ›**: in-app history (disabled at the ends); duplicate visits aren't recorded.
- **Home disc**: Home; the icon is filled while you're on Home.
- **Search pill**:
  - Click or focus opens the dropdown.
  - With an empty field it shows suggested questions, or the conversation once one has started.
  - Typing shows "Ask Ibrahim's AI: “…”" plus matching playlists and items.
  - Enter asks; × clears the field.
  - The Browse icon opens Browse.
  - Click-away or Escape closes the dropdown.
- **Book a call**: opens the Send Mix dialog.
- **Bell**: "What's New" menu linking the latest roles and projects.
- **People icon**: toggles Friend Activity (opens the sidebar if it's hidden).
- **Avatar**: profile menu.
- **– (minimise)**: the `/resume` escape hatch (hover/focus tooltip). **□** toggles fullscreen.

## Library
- Click the "Your Library" title or the ← arrow to collapse to the 72px rail (rail items show tooltips); click again to expand.
- Drag the right edge to resize (280–420px); dragging well past the minimum snaps to the rail. Arrow keys work when the handle is focused.
- 🔍 opens "Search in Your Library" (filters by title or subtitle; Escape clears it). "Custom order ▾" switches to Alphabetical; the pinned Recruiter Mix always stays on top.
- Chips: GitHub ↗ · LinkedIn ↗ · Email (copies + `mailto:`) · Phone (copies + `tel:`) · location.
- Under 1240px window width, with the right panel open, the library shows as a rail without changing your saved preference.

## Right panel
- **Now Playing view**: header name → context playlist; people icon → Friend Activity; "…" → track menu; × → hide. Inside: share (copy link), save, "Show cover letter", Live demo / Code / DOI pills, endorsement link, Credits "Show all", Next in queue (click to play) and "Open queue".
- **Queue**: Now playing + "Next from: &lt;context&gt;"; click any row to play.
- **Friend Activity**: name or avatar → recommender profile; ♪ line → play the linked item; ↗ → Google Scholar.
- Drag the left edge to resize (280–420px).

## Dialogs
Send Mix · Accent colour · Keyboard shortcuts.
- Focus moves into the dialog on open (the first field, or the selected swatch).
- Tab cycles inside it.
- Escape, clicking the backdrop or × closes it, and focus returns to whatever opened it.

**Send Mix submit:**
1. Opens the booking URL in a new tab.
2. Opens the visitor's mail client addressed to Ibrahim with subject `[Portfolio Inquiry] <Company> - <Name>` and the edited message plus a sign-off.
3. Fires a `keepalive` POST to `/api/send-mix` (logging only).
4. Shows a toast.

The email field is required; the message is pre-filled from the Recruiter Mix each time the dialog opens.

## Keyboard shortcuts

| Keys | Action |
|---|---|
| Ctrl/⌘ + K, Ctrl/⌘ + L | Focus search |
| Ctrl/⌘ + / | Shortcuts sheet |
| Esc | Close the topmost layer: menu → shortcuts → theme → Send Mix → search → lyrics |
| Space | Play/pause (ignored in fields and on focused buttons/links/sliders, which keep their native Space) |
| Ctrl/⌘ + → / ← | Next / previous |
| Ctrl/⌘ + ↑ / ↓ | Volume ±10 |
| Alt + S | Shuffle |
| Alt + R | Repeat |
| Alt + ← / → | Back / forward |
| Alt + Shift + L | Collapse/expand library |
| Alt + Shift + R | Toggle the right panel |

Alt-based shortcuts were used where Spotify's desktop app uses Ctrl+S / Ctrl+R, because in a browser those mean Save page and Reload.

## URLs

| View | Hash |
|---|---|
| Home | *(none)* |
| Playlist | `#/playlist/featured-projects`, `#/playlist/tech%3Apython` |
| Recruiter Mix | `#/collection/recruiter-mix` |
| Recommender | `#/user/saeed-murtaza` |
| Lyrics | `#/lyrics` |
| Browse | `#/search` |

Opening a URL restores the view with Home behind it. Pasting a new hash while the app is open navigates to it. "Copy link" in menus and the inspector produces these URLs.

## Accessibility notes
- Every icon-only control has an `aria-label` and a tooltip that also shows on keyboard focus.
- Toggles expose `aria-pressed`; library rows `aria-current`; track rows `aria-selected`; sliders and resize handles use slider/separator roles with values; the search input is a combobox controlling the dropdown; dialogs are `aria-modal` with a labelled title; the toast is `aria-live="polite"`.
- Focus rings appear for keyboard users only.
- Reduced-motion preference is honoured.
