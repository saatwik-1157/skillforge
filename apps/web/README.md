# SkillForge Web (`apps/web`)

Next.js 15 (App Router) + React 19 + Tailwind CSS. Package name: `skillforge-client`.
See the [root README](../../README.md) for the full picture.

## Where things are

| Path | Contents |
| --- | --- |
| `src/app/` | Routes: landing, `(auth)`, `(public)` (businesses, learning, mentors, community), `dashboard/`, `admin/`, `onboarding/` |
| `src/components/` | `ui/` primitives, `layout/`, `landing/`, `shared/` |
| `src/lib/api.ts` | Typed fetch client — attaches the access token, refreshes once on 401 via the httpOnly cookie |
| `src/lib/auth.ts`, `src/hooks/useAuth.ts` | Zustand auth store and hook |
| `next.config.mjs` | `output: 'standalone'`, `/api/*` proxy to `API_PROXY_TARGET` (skipped on Netlify) |
| `netlify/functions/api.js` | Netlify Function that serves the bundled Express API |
| `scripts/prepare-api.mjs` | `build:api` — esbuild-bundles `../api/src/app.ts` into `netlify/functions/_server.cjs`, copies `../api/prisma/schema.prisma` to `prisma/`, and runs `prisma generate` here |

`netlify/functions/_server.cjs` and `prisma/` are generated and git-ignored.

## Commands (run from `apps/web`, or use the root equivalents)

```bash
cp .env.example .env.local
npm ci
npm run dev          # root: npm run web        (next dev, port 3000)
npm run build        # root: npm run build:web  (build:api + next build)
npm start            # root: npm run start:web  (next start)
```

`npm run build` needs `../api/node_modules` installed because `build:api` bundles
the API. The Docker image runs `next build` only (the API is its own container).

`npm run lint` (`next lint`) currently has no ESLint config and prompts
interactively, so it does not work in CI yet.

## Environment

See [`.env.example`](.env.example). `NEXT_PUBLIC_*` values are inlined at build
time — rebuild after changing them.
