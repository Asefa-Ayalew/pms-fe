/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/pms-admin',
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    turbo: {},
  },
};

module.exports = nextConfig;
