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
      // Disable base rule as it doesn't understand TypeScript
      'no-unused-vars': 'off',
      // Use TypeScript-aware version instead
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^[A-Z_]'
      }],

      // recommended rule from react-refresh plugin for Vite/React
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
    ignorePatterns: ['dist'],
  };
  