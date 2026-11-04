# 11 · Content Model (Phase 1)

All portfolio content now lives in **one file, `content/portfolio.json`**. No component contains personal text, links or ids any more. A fork becomes someone else's portfolio by editing that one file (by hand today, through the dev-only dashboard after Phase 2).

## Files

| File | Role |
|---|---|
| `content/portfolio.json` | The live content. Committed to git; the production build bakes it in. |
| `content/portfolio.example.json` | Neutral sample portfolio ("Alex Rivera") for forkers. Contains none of the real personal data (a test enforces this). |
| `src/content/schema.ts` | The zod schema: the single contract for both files, and the first security boundary. |
| `src/data/validateContent.ts` | `parseContent(raw)`: validates and throws a readable list of problems. |
| `src/data/portfolioData.ts` | The loader. `buildRuntime(content)` turns validated content into UI shapes and re-exports the same names components used before (`candidateProfile`, `allPlaylists`, `featuredProjectsTracks`…), plus new ones (`site`, `homeConfig`, `aiConfig`, `resumeConfig`, `footer`, `whatsNew`, `featuredPlaylist`, `accentThemeList`, `defaultAccentThemeId`). |
| `src/types/portfolio.ts` | Content types are `z.infer<>` of the schema, so the JSON, the UI and the future dashboard can't drift apart. |
| `scripts/content-reset.mjs` | `npm run content:reset` replaces the content with the example (asks first; backs up the old file to `content/.backups/`, which is gitignored). |

## Sections of `portfolio.json`

| Key | What it controls |
|---|---|
| `site` | Page `<title>`, meta description, keywords, author, browser theme colour |
| `profile` | Name, `firstName` (used in copy like "Ask Ibrahim's AI"), initials and avatar letter, optional `avatarImage`, role, tagline, "Verified …" label, availability line, location chip, contact details, bio, booking URL, resume PDF path and download file name |
| `home` | Which playlist is "featured" (profile Play button, Top tracks, empty states), shelf titles and subtitles, how many top tracks to show |
| `recruiterMix` | Title, description and subtitle of the built-in bookmark playlist (its id `recruiter-mix` is reserved) |
| `technologies[]` | "Top artists" tiles: name, subtitle, category, monogram, colour, optional image, and the **keywords** used to build each "This Is &lt;tech&gt;" playlist |
| `playlists[]` | Portfolio sections: title, description, subtitle, Now Playing "About …" label, cover colour, optional cover image, art glyph (`artKind`), and the **tracks** (projects, roles, degrees…) |
| `recommenders[]` | Endorsers: details, optional photo, links, linked track, competencies, letter paragraphs |
| `starterPrompts[]` | Suggested questions in the search dropdown and their answers |
| `ai` | The assistant's **intents** (keywords → answer, optional linked track; first match wins, in file order) and `defaultAnswer` |
| `accentThemes[]` | Selectable accent colours; the **first** is the default |
| `coverLetterStanzas[]` | Lyrics-mode cover letter |
| `whatsNew[]` | Track ids shown in the bell menu |
| `resume` | Standard resume page: location line, skills, which playlists appear in which style (`experience` / `projects` / `education` / `publication` / `bullets`, with an optional limit), references heading |
| `footer` | Footer link columns. The "not affiliated with Spotify" notice is fixed in code and can't be removed from content. |

Things the loader **derives**, so editors never maintain them: each track's `playlistId` and 1-based `number`, every playlist's `trackCount`, the virtual Recruiter Mix (always first in `allPlaylists`), and each theme's gradient (from `banner`).

## Text placeholders
AI answers, starter-prompt answers and the default answer can use `{name}`, `{firstName}`, `{email}`, `{phone}`, `{phoneDisplay}` and `{role}`. They're filled from `profile` when shown, so contact details live in one place.

## Validation rules (`src/content/schema.ts`)

| Rule | Why |
|---|---|
| **Links** (`safeUrl`) must be absolute `https:`/`http:` URLs, or `mailto:`/`tel:`; whitespace, quotes and `<>` are rejected | Blocks `javascript:`, `data:`, `vbscript:` and attribute-breaking payloads in any `href` |
| Footer links may also be site paths like `/resume` (never `//host`) | Internal links without allowing protocol-relative URLs |
| **Images** must be `/uploads/<name>.png|jpg|jpeg|webp|avif` | Only files uploaded through the dashboard; no SVG (script-capable), no remote hosts, no `..` |
| PDFs: `/resume.pdf` or `/uploads/<name>.pdf` | Same containment for the resume |
| Colours are 6-digit hex | No CSS injection through style props |
| Ids are lowercase slugs; all ids unique (tracks are unique across all playlists) | Stable URLs and references |
| Every reference resolves: track → recommender, recommender → track, prompt → track, intent → track, What's New → track, featured playlist, resume section → playlist | No broken links or empty views |
| The featured playlist must have at least one track; there must be at least one playlist and one theme | The player always has something to load |
| Length caps on every string | Keeps the layout and the bundle sane |

## When validation runs
- **`npm run build`** now runs `npm run content:validate` (the content test suite) before `next build`. An invalid file stops the build, so it can't reach production.
- **`npm run dev`**: the loader validates on every load and shows the error list in the Next.js error overlay. For example, a `javascript:` GitHub link gives *"profile.github: Use a full https:// link (or mailto: / tel:)"*. This was verified in the browser.
- **`npm run test:unit`** includes the same checks.
- **Production bundles skip the runtime parse.** The dev-only branch is compiled out, so zod (about 27 KB) never ships to visitors. First-load JS is 164 KB (163 KB before Phase 1).

## Behaviour changes worth knowing
- The AI engine (`src/lib/aiEngine.ts`) went from 12 hard-coded branches (223 lines) to an intent loop (63 lines). `processAIQuery(query, config?)` takes an optional config so the dashboard can test a draft. Answers are identical; the 8 original engine tests pass unchanged.
- The resume page builds its sections from `resume.sections`. The DOI line and the GitHub/LinkedIn handles are derived from the links instead of being typed twice.
- `CoverArt` shows an uploaded `coverImage`/`image` when one is set, otherwise the generated art, everywhere covers appear. Profile and recommender photos are supported the same way.
- The accent boot script now applies the **default** theme too (whatever is first in `accentThemes`), not only a saved one, and escapes `<` in its inline JSON.

## Editing by hand (until the dashboard lands)
1. Edit `content/portfolio.json`.
2. Watch the dev server: errors appear immediately with the exact path, e.g. `playlists.0.tracks.2.externalUrl`.
3. Run `npm run content:validate` before committing.
