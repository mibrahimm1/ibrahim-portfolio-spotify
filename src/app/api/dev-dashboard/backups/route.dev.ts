// DEV ONLY: `.dev.ts` files are routes only under `next dev` (see next.config.mjs).
import { checkDashboardRequest, jsonResponse } from '@/lib/dashboard/guard';
import { listBackups, restoreBackup } from '@/lib/dashboard/contentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const blocked = checkDashboardRequest(req);
  if (blocked) return blocked;
  return jsonResponse({ backups: await listBackups() });
}

/** POST { name } → restore that backup (the current file is backed up first). */
export async function POST(req: Request) {
  const blocked = checkDashboardRequest(req, { contentType: 'application/json', maxBytes: 4096 });
  if (blocked) return blocked;
  let name: unknown;
  try {
    ({ name } = await req.json());
  } catch {
    return jsonResponse({ error: 'Body must be JSON' }, 400);
  }
  if (typeof name !== 'string') return jsonResponse({ error: 'name is required' }, 400);
  const result = await restoreBackup(name);
  return result.ok ? jsonResponse(result) : jsonResponse(result, result.status);
}
