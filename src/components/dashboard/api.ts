// Client for the dev-only dashboard API. Every call carries the custom header the server's
// guard requires (cross-site pages can't send it without an approved CORS preflight).

const BASE = '/api/dev-dashboard';
const HEADERS = { 'x-portfolio-dashboard': '1' };

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T;
}

export async function api<T = Record<string, unknown>>(
  method: 'GET' | 'PUT' | 'POST' | 'DELETE',
  path: string,
  body?: unknown
): Promise<ApiResult<T>> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body === undefined ? HEADERS : { ...HEADERS, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = { error: `Unexpected response (${res.status})` };
  }
  return { ok: res.ok, status: res.status, data: data as T };
}

export interface UploadInfo {
  name: string;
  path: string;
  size: number;
  mtimeMs: number;
}

export async function uploadFile(file: File, kind: 'image' | 'pdf') {
  const form = new FormData();
  form.append('file', file);
  form.append('kind', kind);
  const res = await fetch(`${BASE}/uploads`, { method: 'POST', headers: HEADERS, body: form });
  const data = (await res.json().catch(() => ({ error: 'Upload failed' }))) as { path?: string; error?: string };
  return { ok: res.ok, path: data.path, error: data.error };
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
