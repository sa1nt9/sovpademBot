module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    parserOptions: {
      project: './tsconfig.json',
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  };