/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/pms',
  reactStrictMode: true,
  transpilePackages: ['@pms/theme', '@pms/auth', '@pms/core', '@pms/entity'],
  output: 'standalone',
  experimental: {
    turbo: {},
  },
};

module.exports = nextConfig;
