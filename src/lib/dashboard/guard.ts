/**
 * Every dashboard API request passes through here. The dashboard only exists under
 * `next dev`, but while the dev server runs, any website you visit could try to call it
 * from your browser. These checks stop that:
 *
 *  1. NODE_ENV must be "development" (defence in depth on top of the build exclusion).
 *  2. Host must be localhost / 127.0.0.1 / [::1]. This blocks DNS rebinding, where an
 *     attacker's domain resolves to 127.0.0.1 but the browser still sends their Host.
 *  3. If the browser sends Origin or Sec-Fetch-Site, they must say same-origin.
 *  4. A custom `x-portfolio-dashboard: 1` header is required. Browsers only allow that
 *     cross-origin after a CORS preflight, which these routes never approve, so plain
 *     cross-site forms and fetches can't reach the handlers.
 *  5. Writes must use the expected Content-Type and stay under a size limit.
 */

export const DASHBOARD_HEADER = 'x-portfolio-dashboard';

const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])(:\d{1,5})?$/i;

interface GuardOptions {
  env?: string | undefined;
  /** Required media type for the body, e.g. "application/json" or "multipart/form-data". */
  contentType?: string;
  maxBytes?: number;
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export function isLocalHost(host: string | null): boolean {
  return !!host && LOCAL_HOST.test(host);
}

/** Returns a response to send back if the request must be rejected, or null if it may proceed. */
export function checkDashboardRequest(req: Request, options: GuardOptions = {}): Response | null {
  const env = 'env' in options ? options.env : process.env.NODE_ENV;
  // Pretend the route doesn't exist outside development.
  if (env !== 'development') return jsonResponse({ error: 'Not found' }, 404);

  const host = req.headers.get('host');
  if (!isLocalHost(host)) return jsonResponse({ error: 'The dashboard only answers on localhost' }, 403);

  const origin = req.headers.get('origin');
  if (origin !== null) {
    let parsed: URL | null = null;
    try {
      parsed = new URL(origin);
    } catch {
      parsed = null;
    }
    if (!parsed || parsed.host !== host || !/^https?:$/.test(parsed.protocol)) {
      return jsonResponse({ error: 'Cross-origin requests are not allowed' }, 403);
    }
  }

  const fetchSite = req.headers.get('sec-fetch-site');
  if (fetchSite !== null && fetchSite !== 'same-origin' && fetchSite !== 'none') {
    return jsonResponse({ error: 'Cross-site requests are not allowed' }, 403);
  }

  if (req.headers.get(DASHBOARD_HEADER) !== '1') {
    return jsonResponse({ error: `Missing ${DASHBOARD_HEADER} header` }, 403);
  }

  if (options.contentType) {
    const type = (req.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
    if (type !== options.contentType) return jsonResponse({ error: `Expected ${options.contentType}` }, 415);
  }

  if (options.maxBytes) {
    const length = Number(req.headers.get('content-length') ?? '0');
    if (length > options.maxBytes) return jsonResponse({ error: 'Request body is too large' }, 413);
  }

  return null;
}
