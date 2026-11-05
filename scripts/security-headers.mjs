// The one place the production security headers are defined.
//
// `scripts/secure-export.mjs` writes them to `out/_headers` (Netlify, Cloudflare Pages) and
// uses CSP_DIRECTIVES for the per-page <meta> policy; `vercel.json` repeats them for Vercel,
// and a unit test keeps the two in step.

/**
 * Content-Security-Policy, minus the script hashes (added per build, because Next inlines
 * its page data as small <script> blocks whose contents change with every build).
 * `style-src 'unsafe-inline'` is for React `style={…}` attributes (cover colours, gradients).
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'"],
  'manifest-src': ["'self'"],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'worker-src': ["'none'"],
  'frame-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'none'"],
};

/**
 * Directives that only work as a real HTTP header (browsers ignore them in <meta>). Hosts
 * that can't set headers (GitHub Pages) still get everything else from the <meta> policy.
 */
export const HEADER_ONLY_CSP = {
  'frame-ancestors': ["'none'"],
};

/** Sent with every response. */
export const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  // Policy without script hashes: a second CSP only ever tightens the <meta> one, so this
  // is safe on hosts that serve both.
  'Content-Security-Policy': serializeCsp({ ...pick(CSP_DIRECTIVES, ['object-src', 'base-uri', 'form-action']), ...HEADER_ONLY_CSP }),
};

/** Long cache for fingerprinted build assets. */
export const IMMUTABLE_CACHE = 'public, max-age=31536000, immutable';

/** @param {Record<string, string[]>} directives */
export function serializeCsp(directives) {
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(' ')}`)
    .join('; ');
}

/**
 * @param {Record<string, string[]>} obj
 * @param {string[]} keys
 */
function pick(obj, keys) {
  return Object.fromEntries(keys.map((k) => [k, obj[k]]));
}
