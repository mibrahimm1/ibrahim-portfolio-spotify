// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkDashboardRequest, isLocalHost, readBodyLimited, readJsonLimited } from '@/lib/dashboard/guard';
import { containedPath, listBackups, MAX_BACKUPS, readContent, restoreBackup, writeContent } from '@/lib/dashboard/contentStore';
import { deleteUpload, listUploads, MAX_IMAGE_BYTES, safeBaseName, saveUpload, sniffType } from '@/lib/dashboard/uploads';

const PNG = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'));
const JPG = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46]);
const WEBP = new TextEncoder().encode('RIFF\0\0\0\0WEBPVP8 ');
const AVIF = Uint8Array.from([0, 0, 0, 0x1c, ...new TextEncoder().encode('ftypavif')]);
const PDF = new TextEncoder().encode('%PDF-1.4\n%');
const SVG = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>');
const HTML = new TextEncoder().encode('<!doctype html><script>alert(1)</script>');

function req(headers: Record<string, string>, method = 'GET') {
  return new Request('http://127.0.0.1:3000/api/dev-dashboard/content', { method, headers });
}

const ok = { host: '127.0.0.1:3000', 'x-portfolio-dashboard': '1' };

describe('dashboard request guard', () => {
  it('lets a same-origin dashboard request through in development', () => {
    expect(checkDashboardRequest(req({ ...ok, origin: 'http://127.0.0.1:3000', 'sec-fetch-site': 'same-origin' }), { env: 'development' })).toBeNull();
    expect(checkDashboardRequest(req({ ...ok, host: 'localhost:3000' }), { env: 'development' })).toBeNull();
  });

  it.each(['production', 'test', undefined])('pretends not to exist when NODE_ENV is %s', (env) => {
    expect(checkDashboardRequest(req(ok), { env })?.status).toBe(404);
  });

  it.each([
    ['DNS rebinding (foreign Host)', { ...ok, host: 'evil.example.com' }],
    ['LAN address', { ...ok, host: '192.168.1.20:3000' }],
    ['localhost lookalike', { ...ok, host: 'localhost.evil.com' }],
    ['foreign Origin', { ...ok, origin: 'https://evil.example.com' }],
    ['Origin on another port', { ...ok, origin: 'http://127.0.0.1:4000' }],
    ['opaque Origin', { ...ok, origin: 'null' }],
    ['cross-site fetch', { ...ok, 'sec-fetch-site': 'cross-site' }],
    ['same-site but not same-origin', { ...ok, 'sec-fetch-site': 'same-site' }],
    ['missing custom header (plain form/fetch)', { host: '127.0.0.1:3000' }],
    ['wrong custom header value', { ...ok, 'x-portfolio-dashboard': 'yes' }],
  ])('rejects %s', (_name, headers) => {
    expect(checkDashboardRequest(req(headers), { env: 'development' })?.status).toBe(403);
  });

  it('enforces content type and size on writes', () => {
    const textPlain = req({ ...ok, 'content-type': 'text/plain' }, 'PUT');
    expect(checkDashboardRequest(textPlain, { env: 'development', contentType: 'application/json' })?.status).toBe(415);
    const huge = req({ ...ok, 'content-type': 'application/json', 'content-length': String(10 * 1024 * 1024) }, 'PUT');
    expect(checkDashboardRequest(huge, { env: 'development', contentType: 'application/json', maxBytes: 1024 })?.status).toBe(413);
  });

  it('recognises local hosts only', () => {
    expect(isLocalHost('localhost')).toBe(true);
    expect(isLocalHost('[::1]:3000')).toBe(true);
    expect(isLocalHost('127.0.0.2')).toBe(false);
    expect(isLocalHost(null)).toBe(false);
  });
});

describe('content store', () => {
  let root: string;

  beforeEach(async () => {
    root = await fs.mkdtemp(join(tmpdir(), 'portfolio-store-'));
    await fs.mkdir(join(root, 'content'));
    await fs.copyFile(join(process.cwd(), 'content', 'portfolio.example.json'), join(root, 'content', 'portfolio.json'));
  });

  afterEach(async () => {
    await fs.rm(root, { recursive: true, force: true });
  });

  it('saves valid content atomically and backs up the previous file', async () => {
    const { content, mtimeMs } = await readContent(root);
    const next = structuredClone(content) as { profile: { name: string } };
    next.profile.name = 'Changed Name';

    const result = await writeContent(next, { root, baseMtime: mtimeMs });
    expect(result.ok).toBe(true);
    expect(((await readContent(root)).content as typeof next).profile.name).toBe('Changed Name');

    const backups = await listBackups(root);
    expect(backups).toHaveLength(1);
    const backup = JSON.parse(await fs.readFile(join(root, 'content', '.backups', backups[0].name), 'utf8'));
    expect(backup.profile.name).toBe('Alex Rivera');
    // No temp files left behind.
    expect((await fs.readdir(join(root, 'content'))).filter((n) => n.endsWith('.tmp'))).toEqual([]);
  });

  it('refuses invalid content without touching the file', async () => {
    const before = await fs.readFile(join(root, 'content', 'portfolio.json'), 'utf8');
    const { content } = await readContent(root);
    const bad = structuredClone(content) as { profile: { github: string } };
    bad.profile.github = 'javascript:alert(1)';
    const result = await writeContent(bad, { root });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
    expect(await fs.readFile(join(root, 'content', 'portfolio.json'), 'utf8')).toBe(before);
  });

  it('refuses to overwrite a file that changed on disk, unless forced', async () => {
    const { content, mtimeMs } = await readContent(root);
    const result = await writeContent(content, { root, baseMtime: mtimeMs - 1000 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(409);
    expect((await writeContent(content, { root, baseMtime: mtimeMs - 1000, force: true })).ok).toBe(true);
  });

  it(`keeps at most ${MAX_BACKUPS} backups`, async () => {
    const backups = join(root, 'content', '.backups');
    await fs.mkdir(backups);
    for (let i = 0; i < MAX_BACKUPS + 5; i++) {
      await fs.writeFile(join(backups, `portfolio-2020-01-01T00-00-${String(i).padStart(2, '0')}-000Z.json`), '{}');
    }
    const { content } = await readContent(root);
    await writeContent(content, { root });
    expect(await listBackups(root)).toHaveLength(MAX_BACKUPS);
  });

  it('restores a backup and refuses names outside the backup folder', async () => {
    const { content } = await readContent(root);
    const changed = structuredClone(content) as { profile: { name: string } };
    changed.profile.name = 'Second';
    await writeContent(changed, { root });
    const [first] = await listBackups(root);
    expect((await restoreBackup(first.name, root)).ok).toBe(true);
    expect(((await readContent(root)).content as typeof changed).profile.name).toBe('Alex Rivera');

    for (const evil of ['../portfolio.json', '..\\portfolio.json', '/etc/passwd', 'portfolio-x/../../a.json', '%2e%2e%2fportfolio.json']) {
      expect((await restoreBackup(evil, root)).ok).toBe(false);
    }
  });

  it('containedPath rejects traversal', () => {
    expect(containedPath(root, '../x')).toBeNull();
    expect(containedPath(root, 'a/b')).toBeNull();
    expect(containedPath(root, 'a\\b')).toBeNull();
    expect(containedPath(root, '')).toBeNull();
    expect(containedPath(root, 'ok.json')).toBe(join(root, 'ok.json'));
  });
});

describe('uploads', () => {
  let root: string;

  beforeEach(async () => {
    root = await fs.mkdtemp(join(tmpdir(), 'portfolio-uploads-'));
  });

  afterEach(async () => {
    await fs.rm(root, { recursive: true, force: true });
  });

  it('identifies files by their bytes, not their names', () => {
    expect(sniffType(PNG)).toBe('png');
    expect(sniffType(JPG)).toBe('jpg');
    expect(sniffType(WEBP)).toBe('webp');
    expect(sniffType(AVIF)).toBe('avif');
    expect(sniffType(PDF)).toBe('pdf');
    expect(sniffType(SVG)).toBeNull();
    expect(sniffType(HTML)).toBeNull();
    expect(sniffType(new Uint8Array())).toBeNull();
  });

  it('saves an image under a random name in public/uploads', async () => {
    const result = await saveUpload({ name: 'My Photo (1).PNG', bytes: PNG }, 'image', root);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.path).toMatch(/^\/uploads\/my-photo-1-[0-9a-f]{8}\.png$/);
    expect((await listUploads(root)).map((u) => u.path)).toEqual([result.path]);
  });

  it.each([
    ['an SVG renamed to .png', 'logo.png', SVG, 'image'],
    ['an HTML page renamed to .jpg', 'x.jpg', HTML, 'image'],
    ['a PNG sent as the resume', 'resume.pdf', PNG, 'pdf'],
    ['a PDF sent as an image', 'photo.png', PDF, 'image'],
  ] as const)('refuses %s', async (_label, name, bytes, kind) => {
    const result = await saveUpload({ name, bytes }, kind, root);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(415);
    expect(await listUploads(root)).toEqual([]);
  });

  it('refuses empty and oversized files', async () => {
    expect((await saveUpload({ name: 'a.png', bytes: new Uint8Array() }, 'image', root)).ok).toBe(false);
    const big = new Uint8Array(MAX_IMAGE_BYTES + 1);
    big.set(PNG);
    const result = await saveUpload({ name: 'big.png', bytes: big }, 'image', root);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(413);
  });

  it('never lets a crafted name escape the uploads folder', async () => {
    const result = await saveUpload({ name: '../../content/portfolio.json.png', bytes: PNG }, 'image', root);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.path).toMatch(/^\/uploads\/[a-z0-9-]+\.png$/);
    for (const name of ['../../../etc/passwd', '..\\..\\boot.ini', 'a/b/c.png', '.htaccess', '%2e%2e%2f.png']) {
      expect(safeBaseName(name)).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('deletes only real upload names', async () => {
    const saved = await saveUpload({ name: 'a.png', bytes: PNG }, 'image', root);
    expect(await deleteUpload('../content/portfolio.json', root)).toBe(false);
    expect(await deleteUpload('a.svg', root)).toBe(false);
    if (saved.ok) expect(await deleteUpload(saved.name, root)).toBe(true);
    expect(await listUploads(root)).toEqual([]);
  });
});

describe('bounded request bodies', () => {
  /** A chunked request: no Content-Length, so the header check can't see its size. */
  function chunked(chunks: string[]) {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (const c of chunks) controller.enqueue(new TextEncoder().encode(c));
        controller.close();
      },
    });
    return new Request('http://127.0.0.1:3000/api/dev-dashboard/content', {
      method: 'PUT',
      body: stream,
      headers: { 'content-type': 'application/json' },
      // @ts-expect-error -- Node's fetch needs this for streamed bodies
      duplex: 'half',
    });
  }

  it('stops reading a chunked body once it passes the limit', async () => {
    const request = chunked(['{"content":"', 'a'.repeat(600), 'a'.repeat(600), '"}']);
    expect(request.headers.get('content-length')).toBeNull();
    expect(checkDashboardRequest(request, { env: 'development', maxBytes: 1000 })).not.toBeNull(); // no header → 403 anyway
    expect(await readBodyLimited(request, 1000)).toBeNull();
  });

  it('returns the whole body when it fits', async () => {
    const bytes = await readBodyLimited(chunked(['{"a":', '1}']), 1000);
    expect(new TextDecoder().decode(bytes!)).toBe('{"a":1}');
  });

  it('answers 413 for oversized JSON and 400 for invalid JSON', async () => {
    const big = await readJsonLimited(chunked(['"', 'x'.repeat(2000), '"']), 1000);
    expect('response' in big && big.response.status).toBe(413);
    const bad = await readJsonLimited(chunked(['{not json']), 1000);
    expect('response' in bad && bad.response.status).toBe(400);
    const ok = await readJsonLimited(chunked(['{"name":"x"}']), 1000);
    expect(ok).toEqual({ value: { name: 'x' } });
  });
});
