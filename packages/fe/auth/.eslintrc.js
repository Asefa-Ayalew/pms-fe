module.exports = {
  extends: ['@pms/eslint-config/react-internal'],
  rules: {
    // Add any project-specific rules or overrides here
    '@typescript-eslint/no-misused-promises': [
      'error',
      { checksVoidReturn: false },
    ],
  },
};
