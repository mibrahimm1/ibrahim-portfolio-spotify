// DEV ONLY: `.dev.ts` files are routes only under `next dev` (see next.config.mjs).
import { checkDashboardRequest, jsonResponse, readJsonLimited } from '@/lib/dashboard/guard';
import { listBackups, restoreBackup } from '@/lib/dashboard/contentStore';

export const dynamic = 'force-dynamic';

const MAX_BODY = 4096;

export async function GET(req: Request) {
  const blocked = checkDashboardRequest(req);
  if (blocked) return blocked;
  return jsonResponse({ backups: await listBackups() });
}

/** POST { name } → restore that backup (the current file is backed up first). */
export async function POST(req: Request) {
  const blocked = checkDashboardRequest(req, { contentType: 'application/json', maxBytes: MAX_BODY });
  if (blocked) return blocked;
  const read = await readJsonLimited(req, MAX_BODY);
  if ('response' in read) return read.response;
  const name = (read.value as { name?: unknown } | null)?.name;
  if (typeof name !== 'string') return jsonResponse({ error: 'name is required' }, 400);
  const result = await restoreBackup(name);
  return result.ok ? jsonResponse(result) : jsonResponse(result, result.status);
}
