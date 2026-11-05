import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/**
 * Two very different builds:
 *
 * - `next dev` (PHASE_DEVELOPMENT_SERVER): the site plus the content dashboard. Files named
 *   `*.dev.tsx` / `*.dev.ts` (the dashboard and its API) are routes only in this phase.
 * - Everything else (`next build`): a **static export** to `out/`. There is no server at
 *   all, so nothing in production can accept a write. The `*.dev.*` names don't match
 *   `pageExtensions`, so the dashboard is never compiled, bundled or served.
 *
 * @param {string} phase
 * @returns {import('next').NextConfig}
 */
export default function nextConfig(phase) {
  const isDevServer = phase === PHASE_DEVELOPMENT_SERVER;

  /** @type {import('next').NextConfig} */
  const shared = {
    reactStrictMode: true,
    // The dev-tools badge sits on top of the phone tab bar's Home tab.
    devIndicators: false,
    poweredByHeader: false,
  };

  if (isDevServer) {
    return {
      ...shared,
      pageExtensions: ['dev.tsx', 'dev.ts', 'tsx', 'ts'],
      // Its own folder, so `npm run build` (which writes `.next`) can run while dev is up.
      distDir: '.next-dev',
    };
  }

  return {
    ...shared,
    pageExtensions: ['tsx', 'ts'],
    output: 'export',
    // `/resume/index.html` rather than `/resume.html`: served the same way by every host.
    trailingSlash: true,
    // No image optimiser in a static export; no remote images are used either.
    images: { unoptimized: true },
    productionBrowserSourceMaps: false,
  };
}
