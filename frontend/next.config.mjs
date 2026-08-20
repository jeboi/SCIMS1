/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tell Next.js to treat these as server-only packages
  serverExternalPackages: ['tailwindcss', 'jiti', 'perf_hooks'],
};

export default nextConfig;