// DEV ONLY: `.dev.ts` files are routes only under `next dev` (see next.config.mjs).
import { checkDashboardRequest, jsonResponse } from '@/lib/dashboard/guard';
import { readContent, readExample, writeContent } from '@/lib/dashboard/contentStore';

export const dynamic = 'force-dynamic';

const MAX_BODY = 2 * 1024 * 1024;

/** GET → current content + mtime. GET ?template=1 → the example template (for "Reset to template"). */
export async function GET(req: Request) {
  const blocked = checkDashboardRequest(req);
  if (blocked) return blocked;
  if (new URL(req.url).searchParams.get('template') === '1') return jsonResponse(await readExample());
  return jsonResponse(await readContent());
}

/** PUT { content, baseMtime?, force? } → validate, back up, save atomically. */
export async function PUT(req: Request) {
  const blocked = checkDashboardRequest(req, { contentType: 'application/json', maxBytes: MAX_BODY });
  if (blocked) return blocked;

  let body: { content?: unknown; baseMtime?: unknown; force?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Body must be JSON' }, 400);
  }

  const result = await writeContent(body.content, {
    baseMtime: typeof body.baseMtime === 'number' ? body.baseMtime : undefined,
    force: body.force === true,
  });
  return result.ok ? jsonResponse(result) : jsonResponse(result, result.status);
}
