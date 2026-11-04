import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { containedPath } from './contentStore';

/**
 * Dashboard uploads (images and the resume PDF) saved under public/uploads/.
 * The file type is decided by its first bytes, never by the name or the browser's claim,
 * so an HTML page or SVG renamed to .png is refused. SVG is not accepted at all because it
 * can carry script. Saved names are random, so uploads can't overwrite anything.
 */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PDF_BYTES = 10 * 1024 * 1024;

export type UploadType = 'png' | 'jpg' | 'webp' | 'avif' | 'pdf';
export type UploadKind = 'image' | 'pdf';

const UPLOAD_NAME = /^[A-Za-z0-9_-]+\.(png|jpg|webp|avif|pdf)$/;

export function uploadsDir(root = process.cwd()) {
  return join(root, 'public', 'uploads');
}

/** Identifies a file from its magic bytes. */
export function sniffType(bytes: Uint8Array): UploadType | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes.length >= 8 && bytes[0] === 0x89 && ascii(1, 4) === 'PNG' && bytes[4] === 0x0d && bytes[5] === 0x0a) return 'png';
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (bytes.length >= 12 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'webp';
  if (bytes.length >= 12 && ascii(4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(8, 12))) return 'avif';
  if (bytes.length >= 5 && ascii(0, 5) === '%PDF-') return 'pdf';
  return null;
}

/** "My Photo (1).PNG" → "my-photo-1"; never empty. */
export function safeBaseName(original: string): string {
  const stem = original.replace(/\.[^.]*$/, '');
  const slug = stem
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return slug || 'upload';
}

export type SaveResult =
  | { ok: true; path: string; name: string; size: number; type: UploadType }
  | { ok: false; status: 400 | 413 | 415; error: string };

export async function saveUpload(
  file: { name: string; bytes: Uint8Array },
  kind: UploadKind,
  root?: string
): Promise<SaveResult> {
  const max = kind === 'pdf' ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
  if (file.bytes.length === 0) return { ok: false, status: 400, error: 'The file is empty' };
  if (file.bytes.length > max) return { ok: false, status: 413, error: `Files must be under ${max / 1024 / 1024} MB` };

  const type = sniffType(file.bytes);
  const allowed: UploadType[] = kind === 'pdf' ? ['pdf'] : ['png', 'jpg', 'webp', 'avif'];
  if (!type || !allowed.includes(type)) {
    return {
      ok: false,
      status: 415,
      error: kind === 'pdf' ? 'Only PDF files are accepted' : 'Only PNG, JPEG, WebP or AVIF images are accepted (no SVG)',
    };
  }

  const dir = uploadsDir(root);
  await fs.mkdir(dir, { recursive: true });
  const name = `${safeBaseName(file.name)}-${randomBytes(4).toString('hex')}.${type}`;
  const full = containedPath(dir, name);
  if (!full) return { ok: false, status: 400, error: 'Invalid file name' };
  // `wx` fails rather than overwrite if the random name already exists.
  await fs.writeFile(full, file.bytes, { flag: 'wx' });
  return { ok: true, path: `/uploads/${name}`, name, size: file.bytes.length, type };
}

export async function listUploads(root?: string) {
  const dir = uploadsDir(root);
  let names: string[] = [];
  try {
    names = (await fs.readdir(dir)).filter((n) => UPLOAD_NAME.test(n));
  } catch {
    return [];
  }
  const entries = await Promise.all(
    names.map(async (name) => {
      const stat = await fs.stat(join(dir, name));
      return { name, path: `/uploads/${name}`, size: stat.size, mtimeMs: stat.mtimeMs };
    })
  );
  return entries.sort((a, b) => b.mtimeMs - a.mtimeMs);
}

export async function deleteUpload(name: string, root?: string): Promise<boolean> {
  if (!UPLOAD_NAME.test(name)) return false;
  const full = containedPath(uploadsDir(root), name);
  if (!full) return false;
  try {
    await fs.rm(full);
    return true;
  } catch {
    return false;
  }
}
