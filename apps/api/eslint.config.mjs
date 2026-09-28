// ESLint 9 flat config for the API (TypeScript, CommonJS output via tsc).
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      // Logging goes through pino (utils/logger); the one intentional console
      // call (env validation, before the logger exists) is disabled inline.
      'no-console': 'error',
      // Match tsc's noUnusedLocals, and allow `_`-prefixed intentionally-unused
      // params (Express error handlers must declare all four arguments).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
);
