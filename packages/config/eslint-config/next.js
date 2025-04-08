module.exports = {
  extends: [
    'next',
    'next/core-web-vitals',
    'plugin:sonar/base',
    'eslint:recommended',
    'plugin:sonar/recommended',
    'plugin:@typescript-eslint/recommended',
    'eslint-config-turbo',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
  ],
  globals: {
    React: true,
    JSX: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'jsx-a11y'],
  ignorePatterns: ['build/', 'node_modules/', 'dist/'],
  rules: {
    'no-console': 2,
    'no-alert': 2,
    'no-restricted-syntax': [
      'error',
      {
        selector:
          "CallExpression[callee.object.name='console'][callee.property.name!=/^(log|warn|error|info|trace)$/]",
        message: 'Unexpected property on console object was called',
      },
    ],
  },
};
