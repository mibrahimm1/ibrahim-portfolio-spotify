// The last step of `npm run build`. Fails the build if the static export in out/ contains
// anything that could let the live site change or leak the dev tooling:
//
//  - dashboard pages, API routes, source maps or content backups;
//  - dev-only code that should have been dropped (dashboard API paths, the write header,
//    file-writing calls, the in-site "Edit" links);
//  - a page without the hashed CSP, or an inline script/handler the CSP doesn't cover.

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inlineScriptHashes } from './secure-export.mjs';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const outDir = join(root, process.env.PORTFOLIO_CONTENT ? 'out-e2e' : 'out');

/** File or folder names that must not exist anywhere in the export. */
const FORBIDDEN_PATHS = [/(^|\/)dashboard(\/|\.|$)/i, /(^|\/)api(\/|$)/, /\.map$/, /(^|\/)\.backups(\/|$)/, /\.dev\.(t|j)sx?$/, /(^|\/)content\//];

/** Strings that only appear in dev-only code. */
const FORBIDDEN_TEXT = ['dev-dashboard', 'x-portfolio-dashboard', 'writeFile', '.backups', '/dashboard#', 'dev-edit-button', 'sourceMappingURL'];

const TEXT_EXT = /\.(html|js|txt|json|css|svg|xml|webmanifest)$/i;
const REQUIRED = ['index.html', 'resume/index.html', '404.html', '_headers'];

/** The content file this build was meant to use (same rule as next.config.mjs). */
export function expectedContentFile(projectRoot = root) {
  return join(projectRoot, process.env.PORTFOLIO_CONTENT || 'content/portfolio.json');
}

const htmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

/**
 * @param {string} dir
 * @param {string} [contentFile] when given, the home page title must match its `site.title`
 */
export function verify(dir, contentFile) {
  const problems = [];
  if (!existsSync(dir)) return ['out/ not found. Run `next build` first.'];

  // Guards against a stale build cache shipping some other content (e.g. the test fixture).
  if (contentFile && existsSync(join(dir, 'index.html'))) {
    const title = JSON.parse(readFileSync(contentFile, 'utf8')).site?.title ?? '';
    const html = readFileSync(join(dir, 'index.html'), 'utf8');
    if (!html.includes(`<title>${htmlEscape(title)}</title>`)) {
      problems.push(`index.html was not built from ${relative(root, contentFile).split(sep).join('/')} (its site.title is missing): delete .next/ and rebuild`);
    }
  }

  for (const file of REQUIRED) if (!existsSync(join(dir, file))) problems.push(`missing ${file}`);

  for (const file of walk(dir)) {
    const rel = relative(dir, file).split(sep).join('/');
    for (const pattern of FORBIDDEN_PATHS) if (pattern.test(rel)) problems.push(`forbidden file: ${rel}`);
    if (!TEXT_EXT.test(rel)) continue;

    const text = readFileSync(file, 'utf8');
    for (const marker of FORBIDDEN_TEXT) if (text.includes(marker)) problems.push(`"${marker}" found in ${rel}`);

    if (rel.endsWith('.html')) {
      const meta = text.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)">/);
      if (!meta) {
        problems.push(`no CSP <meta> in ${rel}`);
      } else {
        if (text.indexOf(meta[0]) > text.indexOf('<script')) problems.push(`CSP <meta> comes after a script in ${rel}`);
        for (const hash of inlineScriptHashes(text)) if (!meta[1].includes(hash)) problems.push(`inline script ${hash} not in the CSP of ${rel}`);
        if (/script-src[^;]*'unsafe-(inline|eval)'/.test(meta[1])) problems.push(`script-src allows unsafe code in ${rel}`);
      }
      // Hashes can't cover these, and the CSP would block them anyway: fail loudly instead.
      const handler = text.match(/<[^>]+\son[a-z]+\s*=\s*["']/i);
      if (handler) problems.push(`inline event handler in ${rel}: ${handler[0].slice(0, 80)}`);
      if (/href\s*=\s*["']\s*javascript:/i.test(text)) problems.push(`javascript: link in ${rel}`);
    }
  }
  return problems;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const problems = verify(outDir, expectedContentFile());
  if (problems.length) {
    console.error(`verify-build: ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}`);
    process.exit(1);
  }
  console.log('verify-build: out/ is static, dashboard-free and fully covered by the CSP.');
}
