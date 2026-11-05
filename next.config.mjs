import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/**
 * Files named `*.dev.tsx` / `*.dev.ts` (the content dashboard and its API) are only routes
 * while `next dev` runs. In every other phase their names don't match `pageExtensions`, so
 * production builds never compile, bundle or serve them: the dashboard can't exist live.
 *
 * @param {string} phase
 * @returns {import('next').NextConfig}
 */
export default function nextConfig(phase) {
  const isDevServer = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    reactStrictMode: true,
    // The dev-tools badge sits on top of the phone tab bar's Home tab.
    devIndicators: false,
    pageExtensions: isDevServer ? ['dev.tsx', 'dev.ts', 'tsx', 'ts'] : ['tsx', 'ts'],
    // No remote images are used; the old `hostname: '**'` pattern let the image optimizer
    // proxy any host on the internet, so it stays removed.
  };
}
