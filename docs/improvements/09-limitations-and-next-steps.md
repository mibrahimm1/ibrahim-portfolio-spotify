# 09 · Known Limitations, Decisions for You, and Next Steps

## Needs your input before going live

1. **Booking link is still a placeholder.** `candidateProfile.calendarBookingUrl` is `https://calendar.google.com/`. Replace it with your Google Calendar *appointment schedule* URL in `src/data/portfolioData.ts`. Every "Book a call" / "Schedule on Meet" button uses it.
2. **Email delivery goes through the visitor's mail client.** Send Mix now opens `mailto:` with the message, which works without any server secrets. If you want messages delivered even when the visitor has no mail client set up (common on shared or corporate machines), implement sending inside `src/app/api/send-mix/route.ts` (the comment marks the spot) with Resend or Nodemailer and keys from environment variables.
3. ~~**Font licensing.**~~ **Resolved (Phase 0, 4 Nov 2026).** The proprietary Circular files were deleted before the repository was created, so they never entered git history. The site now self-hosts **Figtree** (SIL OFL 1.1), as two variable `woff2` files (Latin and Latin-Extended, weights 300–900, 30 KB total, down from 338 KB) with the licence in `public/fonts/LICENSE`.
4. **Trademark distance.** The UI copies Spotify's interaction patterns and colour system, but uses no logo or brand artwork, generates its own covers, and the footer says it isn't affiliated with Spotify AB. The page `<title>`/description still say "Spotify Desktop Portfolio", which is fine for a personal portfolio, but consider "Spotify-inspired" wording if you ever publicise it widely.
5. **Single-click on track rows.** Rows follow Spotify exactly (click selects, double-click plays). If recruiter analytics show people single-clicking and leaving, switch `TrackRow`'s `onClick` in `src/components/stage/TrackList.tsx` to call `setCurrentTrack(track, true, contextId)`.

## Known limitations
- **Desktop only** (CON-01 / `min-width: 1024px`). The real Spotify mobile web layout (bottom tab bar, full-screen player) isn't implemented.
- **No real artwork.** Covers are generated (`CoverArt`). Real project screenshots or logos would make the shelves far richer. Add an optional `imageUrl` to `Track`/`Playlist` and render it in `CoverArt` when present.
- **No audio** (CON-02). Volume is visual only.
- **Lyrics colour follows the current track**, not a dedicated cover-letter colour. That's intentional, like Spotify, but with pastel covers the canvas is a muted slate.
- **Search** is a client-side substring match over titles, subtitles and credits; the "AI" is the deterministic keyword router in `aiEngine.ts`. A real LLM endpoint would be a drop-in replacement for `processAIQuery`.
- **"Show all"** expands shelves inline rather than opening a dedicated page as Spotify does.

## Suggested next steps (in priority order)
1. Set the booking URL and decide on fonts (items 1 and 3 above).
2. ~~`git init` and commit~~ Done in Phase 0.
3. Add real cover images or screenshots for the eight featured projects.
4. Server-side email delivery (item 2).
5. A Playwright screenshot suite (`toHaveScreenshot`) for Home, Playlist, Lyrics and the dialogs, to catch visual regressions.
6. An ESLint config (`next lint` currently has nothing to run) with `react-hooks` rules.
7. Mobile layout as Phase 2.
