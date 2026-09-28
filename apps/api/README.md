# SkillForge API (`apps/api`)

Express 4 + TypeScript + Prisma 5 (PostgreSQL) REST API. Package name: `skillforge-server`.
See the [root README](../../README.md) for the full picture.

## Where things are

| Path | Contents |
| --- | --- |
| `src/index.ts` | HTTP server entry (listens on `PORT`, graceful shutdown) |
| `src/app.ts` | `createApp()` — middleware + `/health` + routes. Also bundled into the Netlify function by `apps/web/scripts/prepare-api.mjs` |
| `src/config/` | `env.ts` (Zod-validated env), `prisma.ts` (singleton client) |
| `src/routes/index.ts` | Mounts every module router under `API_PREFIX` (default `/api/v1`) |
| `src/modules/<name>/` | `*.route.ts → *.controller.ts → *.service.ts → *.repository.ts` + `*.schema.ts` |
| `src/middleware/` | `auth` (JWT), `rbac`, `validate` (Zod), `rateLimit`, `error` |
| `src/utils/` | `ApiError`, `ApiResponse`, `jwt`, `password`, `mailer`, `cloudinary`, `logger`, `pagination` |
| **`prisma/`** | **`schema.prisma`, `migrations/`, `seed.ts` — the database schema lives here** |

Prisma is kept inside this app (not in a shared package) because the Render
service (`rootDir: apps/api`) and the Docker image (build context `apps/api`)
both need it within this directory. The Netlify build copies `prisma/schema.prisma`
into `apps/web/prisma/` at build time.

## Commands (run from `apps/api`, or use the root `npm run …` equivalents)

```bash
cp .env.example .env         # DATABASE_URL, DIRECT_URL, JWT secrets, ...
npm ci
npm run prisma:generate      # root: npm run db:generate
npm run prisma:migrate       # root: npm run db:migrate   (prisma migrate dev)
npm run prisma:deploy        # root: npm run db:deploy    (prisma migrate deploy)
npm run seed                 # root: npm run db:seed
npm run dev                  # root: npm run api          (tsx watch src/index.ts)
npm run build                # root: npm run build:api    (tsc -> dist/)
npm start                    # root: npm run start:api    (node dist/index.js)
npm test                     # root: npm test             (vitest run)
```

`npm run lint` is defined but currently fails: ESLint 9 is installed and there is
no `eslint.config.*` in this app yet.

## Environment

Every variable the code reads is listed in [`.env.example`](.env.example).
`src/config/env.ts` supplies defaults for most of them; `DIRECT_URL` has no
default and the Prisma CLI requires it.
