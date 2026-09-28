// ESLint 9 flat config for the Next.js app. `next lint` is deprecated as of
// Next 15.5, so linting runs through the ESLint CLI; eslint-config-next 15 still
// ships eslintrc-style configs, which FlatCompat adapts.
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const eslintConfig = [
  {
    ignores: ['.next/**', 'out/**', 'node_modules/**', 'netlify/functions/_server.cjs', 'next-env.d.ts', 'scripts/test-*.mjs'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // Netlify Functions here are plain CommonJS (Node runtime, no bundler), and
    // api.js deliberately require()s the bundled server inside a try/catch so a
    // load failure becomes a readable 500. ES imports aren't an option there.
    files: ['netlify/functions/**/*.js'],
    languageOptions: { sourceType: 'commonjs' },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
];

export default eslintConfig;
