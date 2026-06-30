// next.config.ts
import type { NextConfig } from 'next';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: false, // <-- We'll handle this manually for background updates
  clientsClaim: false, // <-- We'll handle this manually
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export', // <-- Essential for generating a static list of files
  distDir: 'dist', // <-- Optional, but keeps things clean
  images: {
    unoptimized: true, // Required for static export
  },
  turbopack: {},
};

export default withPWA(nextConfig);