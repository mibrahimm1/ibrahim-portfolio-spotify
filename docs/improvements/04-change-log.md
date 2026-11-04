# 04 · Change Log

`A` = added, `M` = modified, `D` = deleted. Line counts are before → after.

## Config and root

| | File | Change |
|---|---|---|
| M | `tailwind.config.ts` | Added Encore surface tokens (`surface`, `elevated`, `highlight`, `menu`, `subdued`, `essential`, `toast`, `verified`), `accent` colours bound to the CSS variables, shadows (`spotify-elevated`, `-art`, `-card`, `-play`), `ease-spotify`, `scale-104`, and keyframes/animations (`fade-in`, `scale-up`, `toast-in`, `equalizer`). The original scales are kept. |
| M | `next.config.mjs` | Removed the wildcard `images.remotePatterns`. |
| A | `docs/improvements/*` | This documentation. |

## `src/app`

| | File | Lines | Change |
|---|---|---|---|
| M | `globals.css` | 219 → 296 | Encore CSS variables, `--banner-color`, keyboard-only focus ring, accent `::selection`, `.spotify-scroll` overlay scrollbars, `.no-scrollbar`, `.equalizer`, `.spotify-input`, `prefers-reduced-motion`. Removed the native-range scrubber CSS and the global always-on scrollbar. |
| M | `layout.tsx` | 56 → 68 | `themeColor`; an inline boot script (generated from `accentThemes`) that applies the saved accent before paint; `suppressHydrationWarning` on `<html>`. |
| M | `page.tsx` | 49 → 79 | Mounts `useKeyboardShortcuts`, `usePlaybackTimer`, `useUrlSync`; narrow-window library fold; suppresses the browser context menu outside text; renders `KeyboardShortcutsModal` and `ContextMenu`; sets `html[data-hydrated]`. |
| M | `resume/page.tsx` | 294 | Scroll fix (`h-screen overflow-y-auto`, print reset), selectable text, `shadow-xs` → `shadow-sm`. |
| M | `api/send-mix/route.ts` | 26 → 40 | JSON/email validation (400s), field caps, metadata-only logging. |
| A | `icon.svg` | 1 | Favicon (accent disc with a pause glyph; no Spotify mark). |

## `src/types`, `src/data`

| | File | Change |
|---|---|---|
| M | `types/portfolio.ts` | `TechnologyAvatar.monogram` + `keywords`; `ActiveViewType` gains `browse`; new `RepeatMode`, `TrackListDensity`, `ContextMenuItem`, `ContextMenuState`. |
| M | `data/portfolioData.ts` | Monograms and keywords for the 8 tech avatars; green hover `#3be477` (Spotify's); the Recruiter Mix subtitle drops the emoji. **No content was changed.** |

## `src/lib`

| | File | Lines | Purpose |
|---|---|---|---|
| A | `catalog.ts` | 98 | `allTracks`, `findTrack`, `findParentPlaylistId`, `resolvePlaylist()` (handles the virtual Recruiter Mix and `tech:*` playlists), `buildTechPlaylist()`, `formatPlaylistLength()`, `shuffleIds()`, `TRACK_DURATION_SECONDS`, `LYRICS_DURATION_SECONDS`, `stanzaStartFractions`. |
| A | `color.ts` | 82 | `deepTone()` (normalises pastels to a readable mid-dark tone, like Spotify's artwork-colour extraction), `withAlpha`, `luminance`, `isLight`. |
| A | `routing.ts` | 47 | `entryToHash` / `hashToEntry` / `isSameEntry`, using Spotify-like routes (`#/playlist/:id`, `#/collection/recruiter-mix`, `#/user/:id`, `#/lyrics`, `#/search`). |
| A | `hooks.ts` | 164 | `useKeyboardShortcuts`, `usePlaybackTimer`, `useUrlSync`, `focusSearch`, `SEARCH_INPUT_ID`. |
| A | `menus.ts` | 155 | `trackMenuItems`, `playlistMenuItems`, `openMenuAt`, `copyToClipboard`, `downloadResume` (removes the three duplicated download implementations). |
| M | `aiEngine.ts` | 219 → 223 | Word-start keyword matching; updated the Friend Activity hint copy. |
| M | `utils.ts` | 12 → 16 | `useIsomorphicLayoutEffect`. |

## `src/stores`

| | File | Lines | Change |
|---|---|---|---|
| M | `usePortfolioStore.ts` | 381 → 659 | **New state:** `playContextId`, `shuffle`/`shuffleOrder`, `repeat`, `volume`/`isMuted`, `selectedTrackId`, `leftSidebarWidth`/`rightSidebarWidth`, `trackListDensity`, `searchQuery`, `chatMessages`, `isShortcutsModalOpen`, `contextMenu`, `toastId`; `rightSidebarMode` gains `queue`. **New actions:** `playTrackInContext`, `toggleShuffle`, `cycleRepeat`, `setVolume`, `toggleMute`, `getQueue`, `toggleLyrics`, `navigateToBrowse`, `restoreView`, `selectTrack`, `openTrackDetails`, `setLeft/RightSidebarWidth`, `setTrackListDensity`, `setSearchQuery`, `askAI`, `clearChat`, `setShortcutsModalOpen`, `open/closeContextMenu`, `closeTopmostOverlay`. **Exports:** `computeQueue`, `LEFT_SIDEBAR`, `RIGHT_SIDEBAR`, `PortfolioState`, `RightSidebarMode`. Preferences persisted under `ibrahim_player_prefs`. Every bug fix from [03](03-bugs-found-and-fixed.md) that lives in state. All original action names and signatures still work. |

## `src/components/common`

| | File | Lines | Purpose |
|---|---|---|---|
| M | `Icons.tsx` | 413 → 306 | Rewritten as solid Encore-style glyphs through a `makeIcon` factory. Original export names kept; added `RepeatOneIcon`, `BrowseIcon`, `ArrowLeft/RightIcon`, `VolumeIcon` (levels/mute), `AddCircleIcon`, `CheckCircleIcon`, `ShareIcon`, `MaximizeIcon`, `ClockIcon`, `HeartIcon`, `ListIcon`, `CompactIcon`, `NoteIcon`, `AlbumIcon`, `MailIcon`, `VerifiedIcon`, plus `ArtGlyph` for cover art (code, work, education, document, people, trophy, heart, note, star, mic). |
| M | `SpotifyButton.tsx` | 55 → 63 | `spotifyButtonClasses()` builder (also used on `<a>`), `white` variant, no-wrap labels, 1.04 hover / no press shrink. |
| M | `Toast.tsx` | 25 → 26 | Spotify-blue toast, fade-up, `aria-live`. |
| A | `Tooltip.tsx` | 99 | Portal tooltip on hover and focus, auto-positioned and clamped to the viewport. |
| A | `IconButton.tsx` | 67 | Icon button + tooltip + `aria-label`, with `subdued`/`circle`/`ghost` variants and the active dot. |
| A | `CoverArt.tsx` | 90 | Generated artwork (palette gradient + glyph + optional title lettering); `artKindFor()`. |
| A | `PlayButton.tsx` | 40 | The accent play/pause disc (48/56px), with a floating card variant. |
| A | `Slider.tsx` | 98 | Accessible drag slider used for progress and volume. |
| A | `ContextMenu.tsx` | 93 | Global menu (portal, viewport clamping, arrow keys, outside-click/scroll/resize/blur to close). |
| A | `FitTitle.tsx` | 52 | Spotify's stepped header-title sizing. |

## `src/components/shell`

| | File | Lines | Change |
|---|---|---|---|
| M | `TopNavBar.tsx` | 167 → 292 | Full rebuild (see [02 § Zone 1](02-spotify-fidelity-audit.md#zone-1-top-bar)). Keeps `top-nav-bar`, `search-bar-pill`, `minimize-escape-hatch`, `escape-hatch-tooltip`, the placeholder text, and the "Return to candidate home" / "Toggle Faculty Endorsements Feed" accessible names. |
| M | `LeftSidebar.tsx` | 218 → 282 | Chips, search-in-library, sort menu, pinned row, playing-context indicator, tooltips when collapsed, context menus, resize handle, `forceCollapsed` prop. Keeps `left-sidebar`, `sidebar-playlist-*`, `recruiter-mix-badge`. |
| M | `RightSidebar.tsx` | 25 → 44 | Queue mode, resizable width, ARIA label per mode. |
| M | `BottomPlayerBar.tsx` | 309 → 256 | Narrow selectors; real shuffle/repeat/volume/mute/fullscreen; `Slider`; panel toggles with active dots; devices menu. Keeps `bottom-player-bar`, `bottom-play-btn`, `lyrics-mic-btn`, `toggle-now-playing-btn`. |
| A | `ResizeHandle.tsx` | 58 | Pointer- and keyboard-resizable panel edge. |

## `src/components/stage`

| | File | Lines | Change |
|---|---|---|---|
| M | `CenterStage.tsx` | 46 → 106 | `StageContext` (scroll ref + width via `ResizeObserver`), instant scroll-to-top, Browse view, footer; removed the floating expand chevron. |
| M | `HomeProfileView.tsx` | 257 → 226 | Profile header pattern, play-the-tour button, shelves (Top artists → tech playlists, Top tracks, Public Playlists, Following). Keeps `home-book-call-btn`, `settings-gear-btn`. |
| M | `PlaylistTableView.tsx` | 310 → 209 | Header pattern, shuffle toggle, playlist menu, List/Compact menu, `TrackList`, Liked-Songs-style empty state; mix detection via `activeView`. Keeps `playlist-title`, `send-mix-pill-btn`. |
| M | `RecommenderProfileView.tsx` | 197 → 189 | Header pattern, verified rosette, competency shelf, About letter, Featuring card, valid link markup. |
| M | `LyricsModeView.tsx` | 87 → 81 | Spotify lyrics canvas, weighted stanza timing, click to seek and play. Keeps `lyrics-mode-stage`, `lyrics-active-stanza`. |
| A | `BrowseView.tsx` | 67 | Browse-all tiles. |
| A | `StageContext.tsx` | 36 | Context + `useStageScroll`. |
| A | `StickyTopBar.tsx` | 52 | In-view sticky bar. |
| A | `Shelf.tsx` | 60 | Width-aware single-row shelf with Show all. |
| A | `MediaCard.tsx` | 76 | Shelf card. |
| A | `TrackList.tsx` | 249 | Grid track table: sticky header, select/double-click/Enter, equalizer, hover controls, context menu, compact density. Keeps `track-bookmark-btn-*`; adds `track-row-*`. |

## `src/components/inspector`, `activity`, `modals`

| | File | Lines | Change |
|---|---|---|---|
| M | `inspector/NowPlayingInspector.tsx` | 182 → 256 | Spotify Now Playing layout (see [02 § Zone 4](02-spotify-fidelity-audit.md#zone-4-right-panel)). Keeps `close-right-sidebar-btn`. |
| A | `inspector/QueuePanel.tsx` | 93 | Queue panel. |
| M | `activity/ListeningActivity.tsx` | 119 → 102 | Friend Activity layout. |
| A | `modals/Dialog.tsx` | 82 | Accessible modal shell (focus in, Tab trap, focus restore, backdrop click). |
| M | `modals/AISearchDropdown.tsx` | 228 → 229 | Anchored dropdown; three states (suggestions / live results / chat); working Inspect chip. Keeps `ai-search-popover`, `starter-prompt-*`, `chat-message-ai`, "Inspect Project:". |
| M | `modals/SendMixModal.tsx` | 219 → 177 | `Dialog`, floating labels, mail-client delivery, synchronous calendar open, keepalive log. Keeps `send-mix-modal`, `mix-summary-textarea`. |
| M | `modals/ThemeSwitcherModal.tsx` | 101 → 57 | `Dialog`, radio-group semantics. Keeps `theme-selector-popover`, `theme-swatch-*`. |
| A | `modals/KeyboardShortcutsModal.tsx` | 74 | The Ctrl+/ shortcuts sheet. |

## Tests

| | File | Change |
|---|---|---|
| M | `tests/setup.ts` | `ResizeObserver` and `scrollIntoView` stubs for jsdom. |
| M | `tests/unit/LeftSidebar.test.tsx` | `/Email ✉/` → `/^Email$/` (the emoji label was intentionally removed). |
| A | `tests/unit/playback.test.ts` | 15 tests: context queue, repeat, prev-restart, shuffle, volume, history fixes, lyrics timing, deep-link restore, overlay order, sidebar collapse, askAI. |
| A | `tests/unit/catalog.test.ts` | 7 tests: tech playlists, mix order, length format, stanza weights, routing round-trip, colour, AI word boundaries. |
| A | `tests/unit/TrackList.test.tsx` | 3 tests: select vs double-click play, save without select, context menu. |
| M | `tests/e2e/portfolio.spec.ts` | Waits for hydration; E2E-02 hovers the row before clicking +; **new** E2E-07 (deep link + double-click + context menu) and E2E-08 (Space + Ctrl+/). |

## Deleted
Nothing was deleted. A pre-change snapshot of `src/`, `tests/` and `tailwind.config.ts` was taken outside the project for diffing during this pass.
