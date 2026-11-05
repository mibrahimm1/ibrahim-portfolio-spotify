#!/usr/bin/env node
// `npm run preview`: serves the static export in out/ the way a static host would, with no
// dependencies. It applies the rules in out/_headers (so the CSP is exercised locally and
// in the E2E tests), redirects `/resume` to `/resume/`, and serves 404.html for misses.
// Only GET and HEAD are accepted, like a static host: there is nothing to write to.
//
//   npm run preview               # http://127.0.0.1:4173
//   PORT=5000 npm run preview

import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'out');
const port = Number(process.env.PORT) || 4173;
const host = process.env.HOST || '127.0.0.1';

if (!existsSync(join(root, 'index.html'))) {
  console.error('serve-out: out/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

/** Parses the Netlify-style `_headers` file into [pattern, headers] rules. */
function loadHeaderRules() {
  const file = join(root, '_headers');
  if (!existsSync(file)) return [];
  const rules = [];
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line.trim()) continue;
    if (!/^\s/.test(line)) {
      const pattern = new RegExp(`^${line.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')}$`);
      rules.push([pattern, {}]);
    } else if (rules.length) {
      const i = line.indexOf(':');
      rules[rules.length - 1][1][line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  return rules;
}
const headerRules = loadHeaderRules();

/** Resolves a URL path to a file inside out/, or null. Never escapes the folder. */
function resolveFile(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded.includes('\0')) return null;
  const full = normalize(join(root, decoded));
  if (full !== root && !full.startsWith(root + sep)) return null;
  if (existsSync(full) && statSync(full).isFile()) return full;
  const index = join(full, 'index.html');
  if (existsSync(index)) return index;
  return null;
}

const server = createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');
  for (const [pattern, headers] of headerRules) {
    if (pattern.test(url.pathname)) for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Content-Type': 'text/plain' });
    return res.end('Method Not Allowed');
  }

  // `/resume` → `/resume/`, as static hosts do for folders.
  if (!url.pathname.endsWith('/') && !extname(url.pathname) && existsSync(join(root, url.pathname, 'index.html'))) {
    res.writeHead(308, { Location: `${url.pathname}/${url.search}` });
    return res.end();
  }

  const file = resolveFile(url.pathname);
  const status = file ? 200 : 404;
  const target = file || join(root, '404.html');
  res.writeHead(status, { 'Content-Type': TYPES[extname(target).toLowerCase()] || 'application/octet-stream' });
  if (req.method === 'HEAD') return res.end();
  createReadStream(target).pipe(res);
});

server.listen(port, host, () => console.log(`serve-out: http://${host}:${port}`));
