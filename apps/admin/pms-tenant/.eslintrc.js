module.exports = {
  extends: ['@pms/eslint-config-custom/next'],
  rules: {
    '@next/next/no-html-link-for-pages': ['error', 'src/app'],
  },
};
