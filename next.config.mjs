import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';
import { dirname, relative, resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

/**
 * The content file the site is built from: content/portfolio.json, unless PORTFOLIO_CONTENT
 * names another JSON file inside the project. The E2E tests use that to build and run
 * against tests/fixtures/portfolio.json, so they pass whatever your own content says.
 */
function contentFile() {
  const override = process.env.PORTFOLIO_CONTENT;
  if (!override) return resolve(root, 'content/portfolio.json');
  const file = resolve(root, override);
  const rel = relative(root, file);
  if (rel.startsWith('..') || isAbsolute(rel) || !file.endsWith('.json')) {
    throw new Error(`PORTFOLIO_CONTENT must be a .json file inside the project (got ${override})`);
  }
  return file;
}

/**
 * Two very different builds:
 *
 * - `next dev` (PHASE_DEVELOPMENT_SERVER): the site plus the content dashboard. Files named
 *   `*.dev.tsx` / `*.dev.ts` (the dashboard and its API) are routes only in this phase.
 * - Everything else (`next build`): a **static export** to `out/`. There is no server at
 *   all, so nothing in production can accept a write. The `*.dev.*` names don't match
 *   `pageExtensions`, so the dashboard is never compiled, bundled or served.
 *
 * A test build (PORTFOLIO_CONTENT set) exports to `out-e2e/` and runs its dev server from
 * `.next-dev-e2e/`, so it never touches the real `out/` or your own dev server.
 *
 * @param {string} phase
 * @returns {import('next').NextConfig}
 */
export default function nextConfig(phase) {
  const isDevServer = phase === PHASE_DEVELOPMENT_SERVER;
  const isTestContent = Boolean(process.env.PORTFOLIO_CONTENT);
  const content = contentFile();

  /** @type {import('next').NextConfig} */
  const shared = {
    reactStrictMode: true,
    // The dev-tools badge sits on top of the phone tab bar's Home tab.
    devIndicators: false,
    poweredByHeader: false,
    webpack(config) {
      config.resolve.alias = { ...config.resolve.alias, '@portfolio-content': content };
      // The persistent build cache doesn't see this alias, so without this a build could
      // reuse modules from a build of *other* content (say, the test fixture).
      if (config.cache && typeof config.cache === 'object') {
        config.cache.version = `${config.cache.version ?? ''}|content:${relative(root, content)}`;
      }
      return config;
    },
  };

  if (isDevServer) {
    return {
      ...shared,
      pageExtensions: ['dev.tsx', 'dev.ts', 'tsx', 'ts'],
      // Its own folder, so `npm run build` (which writes `.next`) can run while dev is up.
      distDir: isTestContent ? '.next-dev-e2e' : '.next-dev',
    };
  }

  return {
    ...shared,
    pageExtensions: ['tsx', 'ts'],
    output: 'export',
    ...(isTestContent ? { distDir: 'out-e2e' } : {}),
    // `/resume/index.html` rather than `/resume.html`: served the same way by every host.
    trailingSlash: true,
    // No image optimiser in a static export; no remote images are used either.
    images: { unoptimized: true },
    productionBrowserSourceMaps: false,
  };
}
