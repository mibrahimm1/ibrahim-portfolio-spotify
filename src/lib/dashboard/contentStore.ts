import { promises as fs } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { randomBytes } from 'node:crypto';
import { PortfolioSchema, formatContentErrors } from '@/content/schema';

/** Server-only file access for the dev dashboard: read, validate, back up, write atomically. */

export const MAX_BACKUPS = 20;
const BACKUP_NAME = /^portfolio-[0-9TZ-]+\.json$/;

export function contentPaths(root = process.cwd()) {
  const contentDir = join(root, 'content');
  return {
    contentDir,
    file: join(contentDir, 'portfolio.json'),
    example: join(contentDir, 'portfolio.example.json'),
    backups: join(contentDir, '.backups'),
  };
}

/** Resolves `name` inside `dir`, refusing anything that escapes it (../, absolute paths, separators). */
export function containedPath(dir: string, name: string): string | null {
  if (!name || name.includes('/') || name.includes('\\') || name.includes('\0')) return null;
  const base = resolve(dir);
  const full = resolve(base, name);
  return full.startsWith(base + sep) ? full : null;
}

export async function readContent(root?: string) {
  const { file } = contentPaths(root);
  const [text, stat] = await Promise.all([fs.readFile(file, 'utf8'), fs.stat(file)]);
  return { content: JSON.parse(text) as unknown, mtimeMs: stat.mtimeMs };
}

export async function readExample(root?: string) {
  const { example } = contentPaths(root);
  return { content: JSON.parse(await fs.readFile(example, 'utf8')) as unknown };
}

export type WriteResult =
  | { ok: true; mtimeMs: number; backup: string | null }
  | { ok: false; status: 400; error: string; issues: { path: (string | number)[]; message: string }[] }
  | { ok: false; status: 409; error: string; mtimeMs: number };

async function writeAtomic(file: string, text: string) {
  // Write next to the target, then rename: a crash mid-write can never leave a half-written file.
  const tmp = `${file}.${process.pid}.${randomBytes(4).toString('hex')}.tmp`;
  await fs.writeFile(tmp, text, 'utf8');
  try {
    await fs.rename(tmp, file);
  } catch (error) {
    await fs.rm(tmp, { force: true });
    throw error;
  }
}

async function backupCurrent(root?: string): Promise<string | null> {
  const { file, backups } = contentPaths(root);
  try {
    await fs.access(file);
  } catch {
    return null;
  }
  await fs.mkdir(backups, { recursive: true });
  const name = `portfolio-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  await fs.copyFile(file, join(backups, name));
  const existing = (await fs.readdir(backups)).filter((n) => BACKUP_NAME.test(n)).sort();
  await Promise.all(existing.slice(0, Math.max(0, existing.length - MAX_BACKUPS)).map((n) => fs.rm(join(backups, n))));
  return name;
}

/**
 * Validates and saves content. `baseMtime` is the modification time the editor loaded;
 * if the file changed on disk since (a hand edit, another tab), the save is refused with
 * 409 unless `force` is set, so nobody silently overwrites someone else's change.
 */
export async function writeContent(
  raw: unknown,
  options: { root?: string; baseMtime?: number; force?: boolean } = {}
): Promise<WriteResult> {
  const result = PortfolioSchema.safeParse(raw);
  if (!result.success) {
    return {
      ok: false,
      status: 400,
      error: formatContentErrors(result.error),
      issues: result.error.issues.map((i) => ({ path: i.path as (string | number)[], message: i.message })),
    };
  }

  const { file } = contentPaths(options.root);
  if (options.baseMtime !== undefined && !options.force) {
    const current = (await fs.stat(file)).mtimeMs;
    if (current !== options.baseMtime) {
      return { ok: false, status: 409, error: 'content/portfolio.json changed on disk since you opened it', mtimeMs: current };
    }
  }

  const backup = await backupCurrent(options.root);
  // Saving the parsed data (not the raw input) strips unknown keys and applies the schema's trimming.
  await writeAtomic(file, JSON.stringify(result.data, null, 2) + '\n');
  return { ok: true, mtimeMs: (await fs.stat(file)).mtimeMs, backup };
}

export async function listBackups(root?: string) {
  const { backups } = contentPaths(root);
  let names: string[] = [];
  try {
    names = (await fs.readdir(backups)).filter((n) => BACKUP_NAME.test(n));
  } catch {
    return [];
  }
  const entries = await Promise.all(
    names.map(async (name) => {
      const stat = await fs.stat(join(backups, name));
      return { name, size: stat.size, mtimeMs: stat.mtimeMs };
    })
  );
  return entries.sort((a, b) => b.name.localeCompare(a.name));
}

export async function restoreBackup(name: string, root?: string): Promise<WriteResult | { ok: false; status: 404; error: string }> {
  const { backups } = contentPaths(root);
  const full = BACKUP_NAME.test(name) ? containedPath(backups, name) : null;
  if (!full) return { ok: false, status: 404, error: 'No such backup' };
  let raw: unknown;
  try {
    raw = JSON.parse(await fs.readFile(full, 'utf8'));
  } catch {
    return { ok: false, status: 404, error: 'No such backup' };
  }
  // Restoring also backs up what's there now, so a restore can itself be undone.
  return writeContent(raw, { root, force: true });
}
