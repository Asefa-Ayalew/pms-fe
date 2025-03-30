/** @type {import('next').NextConfig} */
const nextConfig = { 
  basePath: '/pms',
  reactStrictMode: true,
  transpilePackages: [
    '@pms/theme',
    '@pms/auth', 
    '@pms/core'
  ],
  output: 'standalone'
};

module.exports = nextConfig;
