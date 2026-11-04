# 06 · Design Tokens (as implemented)

Values are taken from the Spotify desktop client's Encore UI. Where they differ from `docs/03_ui_ux_master_blueprint.md` v2.0, the deviation is listed with the reason.

## Colour

### Surfaces

| Token (Tailwind) | Value | Use |
|---|---|---|
| `bg-black` / `shell` | `#000000` | Window frame, top bar, player bar |
| `bg-surface` | `#121212` | Library, centre stage, right panel (`--background-base`) |
| `bg-elevated` | `#1f1f1f` | Home disc, search pill, avatar disc, "Contact" pill |
| `bg-highlight` | `#2a2a2a` | Hover on elevated controls; open library search field |
| `bg-menu` | `#282828` | Context menus, tooltips, dialogs, search dropdown |
| `rgba(255,255,255,.07)` | — | Card hover, chips, inspector cards |
| `rgba(255,255,255,.1)` | — | Row hover, active library row, menu-item hover |
| `rgba(255,255,255,.3)` | — | **Selected** track row |
| `#1a1a1a` | — | Track-table header once stuck |
| `#4d4d4d` | — | Slider track |

### Text

| Token | Value | Use |
|---|---|---|
| `text-white` | `#ffffff` | Primary |
| `text-subdued` | `#b3b3b3` | Secondary: subtitles, metadata, inactive icons |
| `rgba(255,255,255,.7)` | — | Header descriptions, sung lyrics |
| `text-black` | `#000000` | On accent and white buttons; upcoming lyrics |

### Accent (swappable)

| Variable | Default (green) | Tailwind |
|---|---|---|
| `--accent-primary` | `#1ed760` | `bg-accent`, `text-accent` |
| `--accent-hover` | `#3be477` | `bg-accent-hover` |
| `--accent-pressed` | `#1ab752` | `bg-accent-pressed` |
| `--banner-color` | `#117735` | Home header colour |
| `--banner-gradient` | `linear-gradient(180deg, #117735, #121212)` | Kept for compatibility |

Purple, orange, crimson and blue come from `accentThemes` (unchanged apart from green's hover).

### Feedback and brand-adjacent

| Token | Value | Use |
|---|---|---|
| `bg-toast` | `#2e77d0` | Notification toast |
| `verified` | `#4cb3ff` | Verified rosette, Friend Activity dot |
| Recruiter Mix | `linear-gradient(135deg, #450af5, #c4efd9)` cover, `#5038a0` header | Spotify's Liked Songs treatment |

### Derived artwork tones
`deepTone(hex, lightness = 0.38, maxSaturation = 0.62)` keeps the hue of any decorative colour but forces a mid-dark lightness, so white text always reads (`catalog.test.ts` checks `#D5F479`). It's used for playlist headers (L 0.40), the lyrics canvas (0.40), the Highlights card (0.40), Browse tiles (0.42) and the Recommender header (0.36).

## Typography
Family: `Circular Spotify` (Book 400 / Bold 700 / Black 900), falling back to the system UI font.

| Role | Size / weight | Notes |
|---|---|---|
| Header title | 96 → 72 → 48 → 32px / 900, tracking −0.04em, leading 1.05 | `FitTitle` picks the largest size that fits (one line for 96/72, up to two for 48/32) |
| Section title | 24px / 700, tracking-tight | Shelf headings, "About", "Featuring" |
| Inspector track title | 24px / 700 | |
| Lyrics | clamp(24px, 2.3vw, 32px) / 700, leading 1.45 | |
| Card / row title, library item | 16px / 400 | Spotify's 2024 UI uses regular weight here, not bold |
| Secondary / meta / buttons | 14px (buttons bold) | |
| Player-bar artist, times | 12px | |

## Spacing and sizing

| Element | Value |
|---|---|
| Top bar | 64px tall |
| Player bar | 72px tall, 8px side padding |
| Panel gutters | 8px horizontal |
| Library | 340px default, 280–420 resizable, 72px rail |
| Right panel | 360px default, 280–420 resizable |
| Page header | min 340px, 24px side padding, 232px artwork (176px when the stage is under 760px, 128px under 560px) |
| Action bar | 24px padding, 24px gap, 56px play |
| Shelf card | min 180px column, 12px padding, 6px radius |
| Track row | 56px (list) / 32px (compact), 16px padding/gap, 40px thumbnail |
| Library row | 8px padding, 48px art, 6px radius |
| Context-menu item | 40px tall, 12px left padding |
| Chips | 32px tall, 12px padding |
| Icon buttons | 32px hit area (40px in action bars, 48px discs in the top bar) |

## Radii
4px (artwork, rows, menus, tooltips) · 6px (cards, library rows) · 8px (panels, dialogs, inspector cards, toasts) · full (buttons, chips, avatars, sliders).

## Elevation

| Token | Value |
|---|---|
| `shadow-spotify-art` | `0 4px 60px rgba(0,0,0,.5)`: header artwork |
| `shadow-spotify-card` | `0 8px 24px rgba(0,0,0,.5)`: card artwork |
| `shadow-spotify-play` | `0 8px 8px rgba(0,0,0,.3)`: floating play button |
| `shadow-spotify-elevated` | `0 16px 24px rgba(0,0,0,.3), 0 6px 8px rgba(0,0,0,.2)`: menus, tooltips, dialogs, toasts |

## Motion
- Easing `cubic-bezier(0.3, 0, 0, 1)` (`ease-spotify`).
- Hover scale 1.04; press returns to 1.00 (no shrink).
- Card play button: opacity 0 → 1 and translateY 8px → 0 over 200ms.
- Fade/scale-in for overlays: 150ms. Toast: 200ms fade-up.
- Equalizer: four bars at `scaleY` 0.3 ↔ 1 over 0.9s, staggered.
- All of it is disabled under `prefers-reduced-motion`.

## Deviations from blueprint v2.0

| Blueprint | Implemented | Why |
|---|---|---|
| Secondary text `#a9a9a9` | `#b3b3b3` | Spotify's actual value; also the SRS's NFR-A11Y-01 target, with better contrast |
| Top bar 54px | 64px | Current Spotify client |
| Player bar 77px + 1px top border | 72px, no border | Current Spotify client |
| Song row 45px | 56px (32px compact) | Current client; a compact mode is offered |
| Uppercase tracklist header | Sentence case + clock icon | Current client |
| Bold card and library titles | Regular 16px | Current client |
| Search dropdown "×" per recent search | Not implemented | Suggested questions are fixed, not a history |
| Tech avatars "non-clickable" | Clickable → "This Is &lt;tech&gt;" | Every Spotify card is interactive; this also exposes the stack→project mapping |
| Recruiter Mix in "Public Playlists" | Library only | Liked Songs never appears in public playlists |
