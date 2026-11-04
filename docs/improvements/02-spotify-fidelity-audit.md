# 02 · Spotify Fidelity Audit

This compares the original build with the Spotify desktop client (2024+ "Encore" UI, Windows) zone by zone. Each row shows what Spotify does, what the portfolio did, and what it does now.

**Guiding principle:** match Spotify's *interaction grammar* and visual system exactly, but never copy its brand assets. There's no Spotify logo, no album art, and a "not affiliated" footer.

## Global

| Aspect | Spotify | Before | After |
|---|---|---|---|
| Shell | Black frame, `#121212` panels, 8px gutters, 8px radius | ✔ matched | Kept; gutters now only on the sides (Spotify has no gap above the player) |
| Secondary text | `#b3b3b3` | `#a9a9a9` (blueprint token) | `#b3b3b3` (`text-subdued`). Matches Spotify and the SRS's own NFR-A11Y-01 |
| Tooltips | Dark `#282828` bubble, 14px, appears on hover **and focus** | Native `title=` | `Tooltip` component (portal, auto-positioned, keyboard focus) |
| Context menus | Right-click and "…" menus everywhere | None | Global `ContextMenu` with arrow-key navigation, Escape and outside-click to close |
| Toasts | Blue `#2e77d0` rectangle above the player, fades in | Green bouncing pill | Blue, fade-up, 3s, id-based timer |
| Scrollbars | Overlay, invisible until you hover the panel | Always-on 14px thumb | `.spotify-scroll`: transparent until hover |
| Focus | 2px white ring for keyboard users only | Browser default | `:focus-visible` ring, none for mouse |
| Icons | Solid 16/24px glyphs | Stroked Feather icons | Solid icon set rewritten in Encore style |
| Buttons | Bold 14px, never wrap, hover scale 1.04, no press shrink | Wrapped labels, emoji, `active:scale-95` | `spotifyButtonClasses()` with `whitespace-nowrap`, scale 1.04 / 1.00 |
| Right-click outside inputs | Suppressed | Browser menu | Suppressed except on inputs, links and selectable text |
| Reduced motion | Respected | Not handled | `prefers-reduced-motion` turns off animation |

## Zone 1: Top bar

| Spotify | Before | After |
|---|---|---|
| 64px tall | 54px | 64px |
| Left: "•••" app menu, ‹ › history chevrons | macOS traffic-light dots, text glyph arrows | "•••" menu (Home, Browse, Accent colour, Shortcuts, Resume), icon chevrons with disabled state |
| Centre (window-centred): 48px Home disc `#1f1f1f`, filled icon when on Home | 40px, always outline | 48px disc, filled/outline swap, hover `#2a2a2a` |
| Search pill: 48px, `#1f1f1f`, hover border, 2px white ring on focus, divider + Browse icon on the right | 46px, translucent white, `Ctrl+L` kbd badge, **input did nothing** | Spotify pill; the input *is* the search box (live results while typing, Enter asks the AI); clear (×) button; Browse opens the new Browse view |
| Right: white "Explore Premium" pill, bell, friends, avatar inside a 48px disc | Bell not a button; avatar went Home | White "Book a call" pill; bell opens a "What's New" menu (latest roles/projects); friends toggles Friend Activity; avatar opens a profile menu |
| Window controls (Windows) | — | Minimise = recruiter escape hatch to `/resume` (tooltip kept); maximise = real browser fullscreen |

## Zone 2: Your Library

| Spotify | Before | After |
|---|---|---|
| Header: library icon + "Your Library" (16px bold, `#b3b3b3`→white), "+ Create" pill, arrow | ✔ roughly | "+ Contact" pill styled as Create, arrow icon instead of the `«` glyph |
| Filter chips: 32px, `rgba(255,255,255,.07)`, horizontal scroll with fade | Chips with a visible scrollbar (`no-scrollbar` undefined) | Spotify chips, hidden scrollbar, right-edge fade |
| Search-in-library + "Recents" sort row | Missing | Expanding search field that filters the list; sort menu (Custom order / Alphabetical) |
| Rows: 48px art, title 16px **regular**, subtitle 14px, green pin on pinned items, active row highlighted, playing row's title green + speaker icon | Bold titles, emoji pin, green count badge | Matches: Recruiter Mix shows a green pin and "Playlist • N items"; the playing context is green with a speaker glyph |
| Collapsed icon rail (72px) with tooltips | 72px, no tooltips | 72px with right-side tooltips; auto-folds on windows under 1240px while the right panel is open |
| Drag to resize; drag far left to collapse | Fixed width | `ResizeHandle` (pointer + keyboard), 280–420px, snaps to the rail below ~220px, persisted |

## Zone 3: Centre stage

### Page header pattern (Home, Playlist, Profile)

| Spotify | Before | After |
|---|---|---|
| Header in the artwork's colour with `linear-gradient(transparent, rgba(0,0,0,.5))` | Gradients ending in `#121212` | Spotify's two-layer system: header colour + dark gradient; body = same colour under `linear-gradient(rgba(0,0,0,.6), #121212 232px)` |
| 232px artwork with a `0 4px 60px rgba(0,0,0,.5)` shadow | 192px | 232px with that shadow |
| Title sized to fit: 96 → 72 → 48 → 32px, weight 900, tracking −0.04em | Fixed 7xl, wrapped onto three lines | `FitTitle` measures with a `ResizeObserver` and steps through Spotify's sizes |
| In-view sticky bar: fills with the header colour as you scroll, then shows a play button + title | None | `StickyTopBar` |
| Verified rosette (blue `#4cb3ff`) | Green ✓ circle | Blue rosette: "Verified Engineer" / "Verified Academic Endorsement" |

### Home (profile)

| Spotify profile | Before | After |
|---|---|---|
| Shelves: one row that fills the width (min 180px cards), "Show all" | Fixed 8- and 7-column grids, tiny cards | `Shelf`: column count from stage width, overflow hidden, Show all / Show less |
| Cards: transparent → `rgba(255,255,255,.07)` on hover, 48px green play button slides up | Visible card backgrounds, "N items" footer | `MediaCard` matches Spotify |
| "Top artists this month" | Every tile opened Featured Projects | Each tech opens a generated **"This Is &lt;tech&gt;"** playlist (built from keyword matches), and its play button plays it |
| "Top tracks this month" (4-row list) | Missing | Added: the first four Featured Projects as real track rows |
| "Public playlists" | Included Recruiter Mix | Recruiter Mix removed (Liked Songs never shows here); it stays pinned in the library |
| "Following" | Missing | Recommenders shown as followed profiles |
| Footer link columns + © line | Missing | Stage footer on every page except lyrics, with the non-affiliation notice |

### Playlist

| Spotify | Before | After |
|---|---|---|
| Meta: 24px avatar + **owner** • "N songs, about X min" | "Updated October 2026" | Avatar + owner (links Home) • `formatPlaylistLength()`, e.g. "8 items, about 4 min" |
| Action bar: 56px play, shuffle toggle (green + dot), download, invite, "…", List/Compact view menu on the right | Shuffle played a random track; static "Compact List View" caption | Shuffle is a real toggle; "…" opens the playlist menu; List/Compact is a working view switcher (persisted) |
| Track table: sticky column header, CSS grid columns that drop as the panel narrows | Flex with fixed widths, uppercase header | 5/4/3-column CSS grid chosen from stage width; sentence-case header with a clock icon; it sticks under the top bar and goes solid when stuck |
| Row: 56px (32px compact); hover highlight; **click selects** (`rgba(255,255,255,.3)`), **double-click plays**; the index becomes a play icon on hover; the playing row shows an animated green equalizer; + and "…" appear on hover; right-click menu | Click played; static ♫ | All of these, plus Enter to play when the row is focused |
| Liked-Songs empty state: big icon, headline, white "Find songs" pill | Small grey text | "Projects you save will appear here" + "Find projects" |

### Lyrics

| Spotify | Before | After |
|---|---|---|
| Canvas in a saturated tone of the artwork; sung lines translucent white, current white, upcoming black; click a line to seek; toggled by the mic button | `#242424`, grey/white text, an Exit button, a 5s-per-stanza race | Colour derived from the current track (`deepTone`), Spotify's three line states, seek on click (starts playback), Escape or the mic to exit, and a **reading-paced timeline** (~3 words/sec, stanzas weighted by length) |

### New: Browse
Spotify's Browse grid: colour tiles with a bold title and tilted artwork in the corner, covering every portfolio section and every tech playlist. Reached from the Browse icon in the search pill.

## Zone 4: Right panel

| Spotify | Before | After |
|---|---|---|
| Now Playing view: sticky header (context name, "…", ×), big art, title 24px bold + share + save | Letter tile, emoji text button | Generated art, share (copy link), save toggle; the header name links to the context |
| Lyrics-preview card in the track's colour | Always red | "Highlights" in the track's tone + "Show cover letter" |
| About card with a banner image | Plain card | Banner art with a label ("About the project/role/program/paper/award"), domain line, "Live demo" / "Code" / "DOI" pills, endorsement link |
| Credits + "Show all" | All credits | First three + Show all |
| Next in queue showing the **next track** + "Open queue" | Showed the external link | The actual next track (shuffle/repeat aware, plays on click) + Open queue |
| Queue panel | Missing | `QueuePanel`: Now playing + "Next from: &lt;context&gt;" |
| Friend Activity: avatar, name, track line ♪, context line, no cards | Bordered cards | Spotify layout |
| Resizable | Fixed | 280–420px, persisted |

## Zone 5: Player bar

| Spotify | Before | After |
|---|---|---|
| 72px, no top border | 77px with border | 72px, borderless |
| Left: 56px art (opens Now Playing view), title (links), artist, + / ✓ save | ✔ roughly | Art toggles the Now Playing view; title links to the playlist; right-click menu; Spotify's +/✓ circle |
| Transport: shuffle (green + dot), prev, 32px white play, next, repeat off/all/one | Shuffle = skip, repeat inert | Real shuffle order; three-state repeat with the repeat-one icon; prev restarts after 3s |
| Scrubber: 4px, white fill → green on hover, knob on hover/drag, times 12px | Native range overlay, misaligned | `Slider`: pointer-capture drag, keyboard arrows, ARIA slider |
| Right: Now Playing view, lyrics, queue, devices, volume (mute + slider), fullscreen | Volume static; devices/PiP/fullscreen dead | All functional; PiP removed (nothing to show) |
| Active toggles show a small green dot | Some | Consistent via `IconButton active showActiveDot` |
