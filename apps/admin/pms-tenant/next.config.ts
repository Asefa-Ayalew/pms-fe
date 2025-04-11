/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/pms-tenant',
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    turbo: {},
  },
};

module.exports = nextConfig;
