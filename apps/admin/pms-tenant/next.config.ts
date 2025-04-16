/** @type {import('next').NextConfig & { generateEtags?: boolean }} */
const nextConfig = {
  basePath: '/pms-tenant',
  experimental: {
    esmExternals: true,
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/dates',
      '@mantine/modals',
      '@mantine/notifications',
      '@mantine/nprogress',
      '@tabler/icons-react',
      'dayjs',
      'lodash',
      '@pms/auh',
      '@pms/entity',
      '@pms/core',
      '@pms/ui',
    ],
  },

  images: {
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [],
  },

  reactStrictMode: false,
  poweredByHeader: false,
  env: {
    ENVIRONMENT: process.env.NODE_ENV,
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js', 'mdx'],
  distDir: '.next',
  compress: true,
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  output: 'standalone',
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
      '*.scss': ['sass-loader'],
    },
  },
  webpack(config: any) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  generateEtags: true,
};

if (process.env.NODE_ENV === 'production') {
  nextConfig.compress = true;
  nextConfig.productionBrowserSourceMaps = false;
  nextConfig.poweredByHeader = false;
  nextConfig.generateEtags = true;
}

module.exports = nextConfig;
