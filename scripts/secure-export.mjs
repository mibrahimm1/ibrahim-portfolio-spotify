// Runs after `next build`. Adds a strict Content-Security-Policy to the static export:
//
//  1. every HTML page gets a <meta> CSP whose script-src lists the sha256 of each inline
//     <script> on that page (Next inlines its page data; the theme boot script is ours),
//     so no other inline script can run, even if injected;
//  2. `out/_headers` (Netlify, Cloudflare Pages) gets the security headers and the full
//     CSP as a real header, which also carries frame-ancestors;
//  3. `out/.nojekyll` lets GitHub Pages serve the `_next/` folder.
//
// Safe to run twice: an existing CSP <meta> is replaced.

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CSP_DIRECTIVES, HEADER_ONLY_CSP, IMMUTABLE_CACHE, SECURITY_HEADERS, serializeCsp } from './security-headers.mjs';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
// `out/`, or `out-e2e/` for a test build (see next.config.mjs).
const outDir = join(root, process.env.PORTFOLIO_CONTENT ? 'out-e2e' : 'out');

const INLINE_SCRIPT = /<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi;
const CSP_META = /<meta http-equiv="Content-Security-Policy"[^>]*>/i;

/** @param {string} dir @returns {string[]} */
export function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith('.html') ? [path] : [];
  });
}

/** @param {string} html */
export function inlineScriptHashes(html) {
  const hashes = new Set();
  for (const match of html.matchAll(INLINE_SCRIPT)) {
    hashes.add(`'sha256-${createHash('sha256').update(match[1], 'utf8').digest('base64')}'`);
  }
  return [...hashes];
}

/** @param {string[]} hashes */
export function cspFor(hashes, extra = {}) {
  return serializeCsp({ ...CSP_DIRECTIVES, 'script-src': [...CSP_DIRECTIVES['script-src'], ...hashes], ...extra });
}

/** @param {string} html */
export function withCspMeta(html) {
  const policy = cspFor(inlineScriptHashes(html));
  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy}">`;
  if (CSP_META.test(html)) return html.replace(CSP_META, meta);
  // First thing in <head>, so it applies before any script is parsed.
  if (!/<head[^>]*>/i.test(html)) throw new Error('No <head> element');
  return html.replace(/<head[^>]*>/i, (head) => `${head}${meta}`);
}

function main() {
  if (!existsSync(outDir)) {
    console.error('secure-export: out/ not found. Run `next build` first.');
    process.exit(1);
  }

  const allHashes = new Set();
  const pages = htmlFiles(outDir);
  for (const file of pages) {
    const html = withCspMeta(readFileSync(file, 'utf8'));
    writeFileSync(file, html);
    inlineScriptHashes(html).forEach((h) => allHashes.add(h));
  }

  const fullCsp = cspFor([...allHashes], HEADER_ONLY_CSP);
  const global = { ...SECURITY_HEADERS, 'Content-Security-Policy': fullCsp };
  const lines = ['/*', ...Object.entries(global).map(([k, v]) => `  ${k}: ${v}`), '', '/_next/static/*', `  Cache-Control: ${IMMUTABLE_CACHE}`, ''];
  writeFileSync(join(outDir, '_headers'), lines.join('\n'));

  console.log(
    `secure-export: CSP added to ${pages.length} pages (${allHashes.size} inline scripts hashed): ` +
      pages.map((p) => relative(outDir, p).split(sep).join('/')).join(', ')
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
