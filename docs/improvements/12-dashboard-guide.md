# 12 · Content Dashboard (Phase 2)

A visual editor for `content/portfolio.json`. It runs **only on your machine, under `npm run dev`**, and doesn't exist in production builds.

## Using it

```bash
npm run dev
```

Then open **http://localhost:3000/dashboard**. While browsing the site in dev you can also click the orange **Edit content** pill (bottom-left), or **Edit in dashboard (dev)** in any track or playlist menu, to jump straight to that item.

| Area | What you can edit |
|---|---|
| **Profile** | Name, first name (used in copy), initials, photo, role, tagline, labels, locations, bio, contact links, booking link (warns while it's still the placeholder), resume PDF and its download name |
| **Home page** | Featured playlist, shelf titles, number of top tracks, Recruiter Mix text |
| **Playlists & items** | Every section and every item in it: text, links, colours, cover glyph or uploaded cover, credits, endorsement, and moving an item to another playlist |
| **Tech stack** | "Top artists" tiles and their keywords, with a live count of which items each one's "This Is …" playlist will contain |
| **Recommenders** | Profile details, photo, links, linked item, competencies, letter paragraphs |
| **AI assistant** | Suggested questions, keyword answers (first match wins, top to bottom), default answer, and a **Try it** box that runs the real engine against your unsaved draft |
| **Cover letter** | Lyrics-mode paragraphs |
| **Resume page** | Location line, skill groups, which playlists appear and in what style |
| **Accent themes** | Colour options (the first is the default) |
| **What's New & footer** | Bell-menu items and footer link columns |
| **Site & SEO** | Page title, description, keywords, author, theme colour |
| **Media library** | Every uploaded file, with In use / Unused badges, copy path and delete |
| **Raw JSON** | The whole draft as text; Apply puts edits into the draft |
| **Backups** | Restore any of the last 20 saved versions |

### How editing works
- You edit a **draft**. Nothing touches disk until you **Save** (button, or Ctrl/⌘+S). The toolbar shows *All changes saved*, *Unsaved changes*, or *N problems to fix*, and leaving the page with unsaved changes asks first.
- **Validation runs as you type**, using the same schema as the build (see [11-content-model.md](11-content-model.md)). Problems show under the field, as badges on list rows and as counts in the left menu. **Save is disabled while there are problems**, so an unsafe link like `javascript:…` can never be saved.
- **Lists**: Add, Duplicate (with fresh ids), Delete, and reorder by dragging ⠿ or using the arrows. Click a row to expand it.
- **Deleting** shows everywhere the item is used. Optional references (a suggested question's link, a What's New entry) are cleared automatically. Required ones, such as a recommender's linked item, are flagged so you choose a replacement before saving.
- **Ids** change when you leave the field, and every reference to the old id is renamed with it. **From title** generates a unique id from the title.
- **Uploads** (photo, covers, resume PDF) go to `public/uploads/` with random names. Commit them along with your content.
- **Revert** discards the draft. **Import** loads a JSON file into the draft, **Export** downloads it, and **Reset to template** loads the neutral example; none of these touch disk until you save.
- The **preview** on the right shows the *saved* site and refreshes itself after each save. It follows what you're editing (the playlist, recommender, lyrics or resume).
- If `content/portfolio.json` was changed elsewhere (by hand, another tab) after you opened the dashboard, Save asks whether to reload from disk or overwrite.

## Why it can't exist in production

| Layer | How |
|---|---|
| **Not compiled** | Dashboard files are named `*.dev.tsx` / `*.dev.ts`. `next.config.mjs` only accepts those extensions as routes when Next.js runs in its dev-server phase; in every other phase they aren't pages, so `next build` never compiles or ships them. |
| **Not in the site bundle** | The in-site "Edit" pill and menu items sit behind `process.env.NODE_ENV === 'development'`, which the production compiler removes. |
| **Runtime guard** | Every API handler returns 404 unless `NODE_ENV === 'development'` (in case the exclusion were ever bypassed). |

**Verified on 5 Nov 2026:**
- The production build's route list has no `/dashboard` and no `/api/dev-dashboard/*`.
- No server or client output file contains the dashboard's code, header name or UI strings.
- On a running production server (`next start`), `GET /dashboard` and `GET`/`PUT`/`POST` to `/api/dev-dashboard/content`, `/uploads` and `/backups` all return **404**, and the home page has no Edit button.
- First-load JS is unchanged at 164 KB.

## Why other websites can't use it while your dev server runs
Any page open in your browser could try to call `localhost:3000`. The API (`src/lib/dashboard/guard.ts`) rejects a request unless all of these hold:
1. `NODE_ENV` is `development`.
2. The **Host** header is `localhost`, `127.0.0.1` or `[::1]`. This blocks DNS rebinding, where an attacker's domain resolves to your machine.
3. **Origin** and **Sec-Fetch-Site**, when the browser sends them, say *same-origin*.
4. The custom **`x-portfolio-dashboard: 1`** header is present. Browsers only allow custom headers cross-site after a CORS preflight, and these routes never approve one, so forms and scripts on other sites are stopped here.
5. Writes use the expected **Content-Type** and stay under a **size limit** (2 MB for content, about 10 MB for uploads).

The dev server also listens on **127.0.0.1 only** (`next dev -H 127.0.0.1`), so other devices on your network can't reach it.

### File safety
- **Saves** are validated again on the server, the previous file is copied to `content/.backups/` (the last 20 are kept, and the folder is git-ignored), and the new file is written to a temp file and renamed into place, so a crash can't leave half a file. The parsed data is what gets written, so unknown keys are dropped and the schema's trimming applies. A side effect: the first save rewrites keys in schema order.
- **Uploads** are typed by their **first bytes**: PNG, JPEG, WebP, AVIF, or PDF for the resume. An SVG or HTML page renamed to `.png` is refused, SVG is never accepted (it can carry script), files are capped at 5 MB (images) and 10 MB (PDF), and the saved name is random and never overwrites.
- **Backup restore and upload delete** accept only names matching strict patterns, resolved inside their own folder; `../`, `\`, absolute and encoded paths are refused.

## Files

| File | Role |
|---|---|
| `next.config.mjs` | Phase-dependent `pageExtensions` (the build exclusion) |
| `src/app/dashboard/page.dev.tsx`, `layout.dev.tsx` | Dashboard route (noindex) |
| `src/app/api/dev-dashboard/{content,uploads,backups}/route.dev.ts` | The dev-only API. The folder is `dev-dashboard` because Next.js never routes folders starting with `_`. |
| `src/lib/dashboard/guard.ts` | Request checks |
| `src/lib/dashboard/contentStore.ts` | Read, validate, back up, atomic write, conflict detection, restore |
| `src/lib/dashboard/uploads.ts` | Byte sniffing, limits, random names, list, delete |
| `src/components/dashboard/Dashboard.tsx` | Shell: draft, validation, save, toolbar, nav, preview, dialogs, toasts, deep links |
| `src/components/dashboard/model.ts` | Path updates, ids, reference find/clean/rename, new-item factories, AI test config |
| `src/components/dashboard/fields.tsx`, `ListEditor.tsx` | Form fields and the generic list editor |
| `src/components/dashboard/sections/*.tsx` | One editor per content area |
| `src/components/common/DevEditButton.tsx` | The in-site "Edit content" pill |

## Tests
- `tests/unit/dashboardServer.test.ts` (Node environment, temporary folders, never your real files): 31 tests covering the guard matrix (DNS rebinding, LAN host, foreign or opaque origin, cross-site fetch, missing header, content type, size), atomic save + backup, invalid content refused without touching the file, 409 on a concurrent change, backup pruning, restore + traversal attempts, byte sniffing, SVG or HTML disguised as images, size limits and crafted upload names.
- `tests/unit/dashboardModel.test.ts`: 9 tests covering immutable updates, ids, finding/cleaning/renaming references (the result stays valid), new-item ids, and the AI test box.
- `tests/e2e/dashboard.spec.ts` (its own Playwright project, run after the site tests): edit → save → visible on the site; an unsafe link blocks saving; the delete dialog lists references; the API refuses requests without the header. It saves the original content first and restores it afterwards, and skips itself against a production server.
