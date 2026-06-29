import type { NextConfig } from "next";

// eslint-disable-next-line
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {},
};

export default withPWA(nextConfig);
