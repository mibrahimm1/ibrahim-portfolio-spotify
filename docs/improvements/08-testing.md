# 08 · Testing

## Results at hand-off

| Check | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit -p .` | ✅ clean |
| Production build | `npx next build` | ✅ clean (`/` 43.3 kB, 163 kB first-load JS) |
| Unit (Vitest) | `npm run test:unit` | ✅ **47 / 47** across 8 files |
| E2E (Playwright, Chromium) | `npm run test:e2e` | ✅ **8 / 8** |
| Manual browser pass | dev server at 1440×900 | Home, playlist, Recruiter Mix, This Is Python, Browse, lyrics, search (typing / Enter / chip), queue, context menu, toast, back/forward, deep links |

## Unit suites

| File | Tests | Covers |
|---|---|---|
| `aiEngine.test.ts` *(original)* | 8 | Keyword routing to the right answer and track |
| `usePortfolioStore.test.ts` *(original)* | 5 | Bookmarks, play/progress, history, themes, next/prev |
| `AISearchDropdown.test.tsx` *(original)* | 2 | Starter prompts render; clicking one gives a first-person answer and the "Inspect Project:" chip |
| `LeftSidebar.test.tsx` *(original, 1 assertion updated)* | 3 | Library and chips render, live mix count, navigation |
| `TopNavBar.test.tsx` *(original)* | 4 | Search placeholder, Home, Friends toggle, escape hatch + tooltip |
| `playback.test.ts` *(new)* | 15 | Context queue, repeat off/all/one, prev-restart, shuffle order, repeat cycle, volume clamp/mute, mix back/forward fix, history dedupe, lyrics toggle and timing, deep-link restore, Friend Activity re-open, Escape layering, library snap-collapse, askAI |
| `catalog.test.ts` *(new)* | 7 | Every tech playlist non-empty, mix order + unknown ids, length formatting, stanza weights, hash round-trip, `deepTone` contrast, AI word boundaries |
| `TrackList.test.tsx` *(new)* | 3 | Click selects / double-click plays in context, save doesn't select, right-click menu |

## E2E flows (`tests/e2e/portfolio.spec.ts`)

| ID | Flow |
|---|---|
| E2E-01 | The five zones render |
| E2E-02 | Open Work Experience → hover the row → save Horquva → badge shows 1 → Send Mix dialog pre-filled with "Horquva" |
| E2E-03 | Search pill → suggested question → AI answer mentions 89% / BizBuddy → Escape closes |
| E2E-04 | Gear → Accent colour → Purple → `--accent-primary` is `#8B5CF6` |
| E2E-05 | Escape-hatch tooltip → `/resume` loads |
| E2E-06 | Mic → lyrics view with an active stanza |
| **E2E-07** *(new)* | Deep link `#/playlist/work-experience` → double-click BizBuddy → inspector + player show it playing → right-click menu → Escape closes it |
| **E2E-08** *(new)* | Space plays → Ctrl+/ opens shortcuts → Escape closes |

## Test changes and why
1. **`LeftSidebar.test.tsx`**: `getByText(/Email ✉/i)` → `getByText(/^Email$/)`. The chip intentionally lost its emoji to match Spotify's text-only chips.
2. **E2E `beforeEach`** now waits for `html[data-hydrated="true"]`. Against `next dev`, server-rendered buttons are visible before React attaches handlers, so early clicks were silently lost. This was a flaky-test race, not an app bug; production hydrates far faster, but the wait is correct either way.
3. **E2E-02** hovers the track row before clicking +. Like Spotify, the save button is `visibility: hidden` until the row is hovered or focused, and Playwright won't click hidden elements.
4. **`tests/setup.ts`** stubs `ResizeObserver` and `Element.scrollIntoView`, which jsdom lacks.

## Running E2E
`playwright.config.ts` starts `npm run start` (a production server, so run `npm run build` first) unless something is already listening on :3000, in which case it reuses that (a dev server works too, thanks to the hydration wait).

```bash
npm run build
```

```bash
npm run test:e2e
```

## Not covered by automated tests
- Mail-client hand-off and the calendar tab (browser and OS dependent). Verify manually after setting the real booking URL.
- Visual pixel fidelity (no screenshot-diff suite). See [09](09-limitations-and-next-steps.md).
- Fullscreen API.
