/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    env: {
      browser: true,
      es2020: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: {
        jsx: true,
      },
    },
    plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react-hooks/recommended',
    ],
    rules: {
      // allow UPPER_SNAKE_CASE “constants” even if unused (e.g. for config)
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
  
      // recommended rule from react-refresh plugin for Vite/React
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
    ignorePatterns: ['dist'],
  };
  