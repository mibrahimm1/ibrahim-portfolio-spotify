# Contributing

Thanks for helping. This project is a portfolio template, so changes should keep working for anyone's content, not just the original author's.

## Setup

```bash
npm ci
```

```bash
npx playwright install chromium
```

```bash
npm run dev
```

## Before you open a pull request

Run the same checks CI runs:

```bash
npx tsc --noEmit -p .
```

```bash
npm run test:unit
```

```bash
npm run build
```

```bash
npm run test:e2e
```

- **New behaviour needs a test.** Unit tests live in `tests/unit/`, browser flows in `tests/e2e/` (`portfolio.spec.ts` for desktop, `mobile.spec.ts` for phones, `dashboard.spec.ts` for the editor).
- **Tests use the fixture content.** Write assertions against `tests/fixtures/portfolio.json`, never against `content/portfolio.json`, which is each person's own content.
- **Content changes go through the schema.** A new content field needs a rule in `src/content/schema.ts` (URLs via `safeUrl`, images via the `/uploads/` path rule), a dashboard field, and an entry in the example template and the fixture.
- **Keep production static.** No API routes, server actions or runtime secrets. Anything for development only goes in a `*.dev.ts(x)` file or behind `process.env.NODE_ENV === 'development'`, and `scripts/verify-build.mjs` must still pass.
- **No inline scripts or event-handler attributes.** The CSP allows only the build's own hashed scripts.
- **Stay "inspired by", not a copy.** No Spotify logos, artwork, fonts or other brand assets.

## Commits

Small, focused commits, with a message that says what changed and why. One topic per pull request.

## Reporting security issues

Please don't open a public issue. See [`SECURITY.md`](SECURITY.md).
