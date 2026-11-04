/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // No remote images are used; the previous `hostname: '**'` pattern let the
  // image optimizer proxy any host on the internet, so it has been removed.
};

export default nextConfig;
