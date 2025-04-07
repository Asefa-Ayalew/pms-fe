/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/pms',
  reactStrictMode: true,
  transpilePackages: ['@pms/theme', '@pms/auth', '@pms/core'],
  output: 'standalone',
  experimental: {
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/dates',
    ],
  },
};

module.exports = nextConfig;
