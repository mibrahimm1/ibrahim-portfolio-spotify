// DEV ONLY: `.dev.ts` files are routes only under `next dev` (see next.config.mjs).
import { checkDashboardRequest, jsonResponse, readBodyLimited } from '@/lib/dashboard/guard';
import { deleteUpload, listUploads, MAX_PDF_BYTES, saveUpload } from '@/lib/dashboard/uploads';

export const dynamic = 'force-dynamic';

// The largest file allowed plus room for the multipart framing.
const MAX_BODY = MAX_PDF_BYTES + 64 * 1024;

export async function GET(req: Request) {
  const blocked = checkDashboardRequest(req);
  if (blocked) return blocked;
  return jsonResponse({ uploads: await listUploads() });
}

/** POST multipart { file, kind: "image" | "pdf" } → saved under public/uploads with a random name. */
export async function POST(req: Request) {
  const blocked = checkDashboardRequest(req, { contentType: 'multipart/form-data', maxBytes: MAX_BODY });
  if (blocked) return blocked;

  const bytes = await readBodyLimited(req, MAX_BODY);
  if (!bytes) return jsonResponse({ error: 'Request body is too large' }, 413);
  let form: FormData;
  try {
    // Re-parse the bounded copy (multipart needs the original boundary from Content-Type).
    form = await new Response(bytes, { headers: { 'content-type': req.headers.get('content-type') ?? '' } }).formData();
  } catch {
    return jsonResponse({ error: 'Expected a multipart form' }, 400);
  }
  const file = form.get('file');
  const kind = form.get('kind') === 'pdf' ? 'pdf' : 'image';
  if (!(file instanceof File)) return jsonResponse({ error: 'No file received' }, 400);

  const result = await saveUpload({ name: file.name, bytes: new Uint8Array(await file.arrayBuffer()) }, kind);
  return result.ok ? jsonResponse(result, 201) : jsonResponse(result, result.status);
}

/** DELETE ?name=<file> → remove one upload. */
export async function DELETE(req: Request) {
  const blocked = checkDashboardRequest(req);
  if (blocked) return blocked;
  const name = new URL(req.url).searchParams.get('name') ?? '';
  return (await deleteUpload(name)) ? jsonResponse({ ok: true }) : jsonResponse({ error: 'No such upload' }, 404);
}
