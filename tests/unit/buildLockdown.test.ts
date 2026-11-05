// @vitest-environment node
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
// @ts-expect-error -- plain .mjs build script, no type declarations
import { inlineScriptHashes, withCspMeta } from '../../scripts/secure-export.mjs';
// @ts-expect-error -- plain .mjs build script, no type declarations
import { verify } from '../../scripts/verify-build.mjs';
// @ts-expect-error -- plain .mjs build script, no type declarations
import { SECURITY_HEADERS, IMMUTABLE_CACHE } from '../../scripts/security-headers.mjs';

const sha = (s: string) => `'sha256-${createHash('sha256').update(s, 'utf8').digest('base64')}'`;
const page = (body = '') =>
  `<!DOCTYPE html><html><head><meta charset="utf-8"><script>window.boot=1</script><script src="/_next/static/a.js" async></script></head><body>${body}<script>self.__next_f.push([1,"x"])</script></body></html>`;

describe('secure-export: per-page CSP', () => {
  it('hashes every inline script, and only inline ones', () => {
    expect(inlineScriptHashes(page())).toEqual([sha('window.boot=1'), sha('self.__next_f.push([1,"x"])')]);
  });

  it('puts the CSP first in <head>, listing exactly those hashes', () => {
    const html = withCspMeta(page());
    const meta = html.match(/<head><meta http-equiv="Content-Security-Policy" content="([^"]+)">/);
    expect(meta).not.toBeNull();
    const policy = meta![1];
    expect(policy).toContain(`script-src 'self' ${sha('window.boot=1')} ${sha('self.__next_f.push([1,"x"])')};`);
    expect(policy).not.toMatch(/unsafe-inline'[^;]*;.*script-src|script-src[^;]*unsafe/);
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("form-action 'none'");
  });

  it('replaces rather than duplicates the policy when run twice', () => {
    const twice = withCspMeta(withCspMeta(page()));
    expect(twice.match(/Content-Security-Policy/g)).toHaveLength(1);
  });
});

describe('verify-build', () => {
  let dir: string;
  const put = (rel: string, text: string) => {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), text);
  };

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'verify-build-'));
    for (const rel of ['index.html', 'resume/index.html', '404.html']) put(rel, withCspMeta(page()));
    put('_headers', '/*\n  X-Content-Type-Options: nosniff\n');
    put('_next/static/chunks/app.js', 'console.log("site")');
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it('passes a clean export', () => {
    expect(verify(dir)).toEqual([]);
  });

  it.each([
    ['dashboard/index.html', '<html></html>'],
    ['api/dev-dashboard/content/index.html', '{}'],
    ['_next/static/chunks/app.js.map', '{}'],
    ['content/portfolio.json', '{}'],
  ])('rejects a forbidden file: %s', (rel, text) => {
    put(rel, text);
    expect(verify(dir).join('\n')).toContain('forbidden file');
  });

  it.each(['dev-dashboard', 'x-portfolio-dashboard', 'writeFile', '/dashboard#', 'sourceMappingURL'])(
    'rejects dev-only code left in a bundle: %s',
    (marker) => {
      put('_next/static/chunks/leak.js', `var u="${marker}"`);
      expect(verify(dir).join('\n')).toContain(marker);
    }
  );

  it('rejects a page without the CSP', () => {
    put('index.html', page());
    expect(verify(dir)).toContain('no CSP <meta> in index.html');
  });

  it('rejects an inline script the CSP does not cover', () => {
    put('index.html', withCspMeta(page()).replace('</body>', '<script>alert(1)</script></body>'));
    expect(verify(dir).join('\n')).toMatch(/inline script 'sha256-.*' not in the CSP of index\.html/);
  });

  it('rejects inline event handlers and javascript: links', () => {
    put('index.html', withCspMeta(page('<img src="x" onerror="alert(1)"><a href="javascript:alert(1)">x</a>')));
    const problems = verify(dir).join('\n');
    expect(problems).toContain('inline event handler');
    expect(problems).toContain('javascript: link');
  });

  it('rejects a build whose home page came from other content (stale build cache)', () => {
    const content = join(dir, 'content.json');
    writeFileSync(content, JSON.stringify({ site: { title: 'Alex Rivera — Engineer & "Builder"' } }));
    put('index.html', withCspMeta(page().replace('<head>', '<head><title>Someone Else</title>')));
    expect(verify(dir, content).join('\n')).toContain('was not built from');
    put('index.html', withCspMeta(page().replace('<head>', '<head><title>Alex Rivera — Engineer &amp; &quot;Builder&quot;</title>')));
    expect(verify(dir, content)).toEqual([]);
  });

  it('requires the main pages and the headers file', () => {
    rmSync(join(dir, '_headers'));
    rmSync(join(dir, 'resume'), { recursive: true });
    expect(verify(dir)).toEqual(expect.arrayContaining(['missing resume/index.html', 'missing _headers']));
  });
});

describe('host configs', () => {
  it('vercel.json sends the same security headers as out/_headers', () => {
    const vercel = JSON.parse(readFileSync(join(__dirname, '../../vercel.json'), 'utf8'));
    expect(vercel.framework).toBeNull(); // plain static hosting: no serverless functions
    expect(vercel.outputDirectory).toBe('out');
    const all = vercel.headers.find((h: { source: string }) => h.source === '/(.*)');
    expect(Object.fromEntries(all.headers.map((h: { key: string; value: string }) => [h.key, h.value]))).toEqual(SECURITY_HEADERS);
    const cache = vercel.headers.find((h: { source: string }) => h.source === '/_next/static/(.*)');
    expect(cache.headers).toEqual([{ key: 'Cache-Control', value: IMMUTABLE_CACHE }]);
  });

  it('frames are refused and nothing can be posted', () => {
    expect(SECURITY_HEADERS['X-Frame-Options']).toBe('DENY');
    expect(SECURITY_HEADERS['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(SECURITY_HEADERS['Content-Security-Policy']).toContain("form-action 'none'");
  });
});
