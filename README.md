# SkillForge

> **Turn Skills Into Successful Businesses.**
>
> An end-to-end entrepreneurship enablement platform. Discover business ideas
> from your skills and budget, learn the essentials, follow a step-by-step
> roadmap, connect with mentors, and launch your micro-enterprise.
>
> **Designed & Developed by Saatwik Sairaam Vasamsetti.**

![stack](https://img.shields.io/badge/Next.js-15-black) ![react](https://img.shields.io/badge/React-19-149eca) ![node](https://img.shields.io/badge/Express-4-000000) ![db](https://img.shields.io/badge/PostgreSQL-16-336791) ![orm](https://img.shields.io/badge/Prisma-5-2d3748) ![license](https://img.shields.io/badge/license-MIT-green)

---

## Features

| Area | What's included |
| --- | --- |
| **Landing** | Animated hero, stats, how-it-works, categories, testimonials, FAQ, newsletter, dark mode, fully responsive |
| **Auth** | Register, login, JWT + rotating refresh tokens, OTP email verification, password reset, Google login (API), RBAC |
| **Entrepreneur** | Profile, skill/interest assessment, **business readiness score**, dashboard, bookmarks, certificates, achievements |
| **Recommendation engine** | Scores business ideas against your skills, budget, time & type |
| **Business detail** | Overview, SWOT, investment breakdown, licenses, marketing strategy, risks, revenue model, lean canvas, checklist |
| **Roadmap** | Interactive step-by-step journey with per-user progress tracking |
| **Learning** | Courses, lessons, enrollments, progress, auto-issued certificates |
| **Mentors** | Profiles, verification, session booking, reviews & ratings, mentor dashboard |
| **Community** | Forum posts (questions and success stories), threaded comments, likes, trending tags |
| **Notifications** | In-app notifications + email |
| **Admin** | Users, content approval, mentor verification, complaints, announcements, overview stats |

See **[ARCHITECTURE.md](ARCHITECTURE.md)** for the system design and the
backend module conventions.

---

## Architecture

```
  Browser
     │
     ▼
┌──────────────────────────┐   HTTPS / JSON              ┌──────────────────────────┐
│  apps/web                │   Authorization: Bearer     │  apps/api                │
│  Next.js 15 (App Router) │ ──────────────────────────▶ │  Express 4 + TypeScript  │
│  React 19 · Tailwind     │   + httpOnly refresh cookie │  /api/v1/*   /health     │
│  NEXT_PUBLIC_API_URL     │                             │  Zod · JWT · Helmet      │
└──────────────────────────┘                             └────────────┬─────────────┘
                                                                      │ Prisma Client
                                                                      ▼
                                                         ┌──────────────────────────┐
                                                         │  PostgreSQL 16           │
                                                         │  schema: apps/api/prisma │
                                                         └──────────────────────────┘
```

The web app finds the API through `NEXT_PUBLIC_API_URL`:

- **Absolute URL** (e.g. `http://localhost:4000/api/v1`) — the browser calls the API directly (CORS is allowed for `CLIENT_URL`).
- **Relative `/api/v1`** — same-origin. Locally, `next.config.mjs` proxies `/api/*` to `API_PROXY_TARGET`
  (default `http://localhost:4055`); on Netlify, `netlify.toml` routes `/api/*` to a serverless function
  that runs the same Express app (bundled from `apps/api/src/app.ts` by `apps/web/scripts/prepare-api.mjs`).

Backend modules follow one shape:
`*.route.ts → *.controller.ts → *.service.ts → *.repository.ts` + `*.schema.ts` (Zod).

---

## Repository layout

```
skillforge/
├── apps/
│   ├── api/                    # Express + TypeScript + Prisma API  (package: skillforge-server)
│   │   ├── prisma/             # schema.prisma, migrations/, seed.ts  ← the database lives here
│   │   ├── src/
│   │   │   ├── config/         # env.ts (validated env), prisma.ts (singleton client)
│   │   │   ├── middleware/     # auth, rbac, validate, rateLimit, error
│   │   │   ├── modules/        # auth, user, business, roadmap, learning, mentor,
│   │   │   │                   # community, notification, admin
│   │   │   ├── routes/         # index.ts mounts every module under API_PREFIX
│   │   │   ├── utils/          # ApiError, ApiResponse, jwt, password, mailer, cloudinary, logger
│   │   │   ├── app.ts          # createApp() — used by index.ts and the Netlify function
│   │   │   └── index.ts        # HTTP server entry
│   │   ├── Dockerfile
│   │   └── .env.example
│   └── web/                    # Next.js 15 web app  (package: skillforge-client)
│       ├── src/                # app/ (routes), components/, hooks/, lib/
│       ├── netlify/functions/  # api.js — serverless wrapper around the bundled API
│       ├── scripts/prepare-api.mjs
│       ├── public/
│       ├── Dockerfile
│       └── .env.example
├── docs/                       # SkillForge-Guide.pdf + its generator script
├── docker-compose.yml          # db + api + web
├── netlify.toml                # Netlify: web + API function (base = apps/web)
├── render.yaml                 # Render Blueprint: db + api + web
├── package.json                # root convenience scripts (delegate with npm --prefix)
├── .env.example                # Docker Compose variables
├── ARCHITECTURE.md · DEPLOYMENT.md · INTEGRATIONS.md
└── LICENSE
```

Each app keeps **its own `package.json` and `package-lock.json`** and is installed
independently — there are no npm workspaces. This is deliberate: Render
(`rootDir`), Netlify (`base`) and Docker (build context) each build a single app
directory. The root `package.json` only holds convenience scripts plus
`concurrently` for `npm run dev`.

---

## Tech stack

**Web** — Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS ·
shadcn-style UI primitives · Framer Motion · Lucide · next-themes · Zustand · Sonner

**API** — Node.js 20+ · Express 4 · TypeScript · Prisma 5 · PostgreSQL 16 · Zod ·
jsonwebtoken · bcryptjs · Helmet · CORS · express-rate-limit · Multer + Cloudinary ·
Nodemailer · google-auth-library · Pino

**Tooling / ops** — Vitest · tsx · esbuild (Netlify function bundle) · Docker ·
Docker Compose · Render Blueprint · Netlify (`@netlify/plugin-nextjs`)

---

## Getting started

**Prerequisites:** Node.js 20+ and npm, plus Docker (for Postgres) or a local PostgreSQL 16.

### 1. Install

```bash
npm install          # root: installs concurrently (only needed for `npm run dev`)
npm run setup        # npm ci in apps/api and apps/web
```

### 2. Environment

```bash
cp apps/api/.env.example apps/api/.env          # API + Prisma
cp apps/web/.env.example apps/web/.env.local    # Next.js
cp .env.example .env                            # optional: docker compose overrides
```

The defaults in `apps/api/.env.example` match the Postgres started by
`docker compose up -d db`. See [Environment variables](#environment-variables).

### 3. Database

```bash
docker compose up -d db     # Postgres 16 on localhost:5432
npm run db:generate         # prisma generate
npm run db:migrate          # prisma migrate dev (applies apps/api/prisma/migrations)
npm run db:seed             # demo users, businesses, mentors, roadmaps
```

### 4. Run

```bash
npm run dev                 # API + web together (concurrently)
# or separately, in two terminals:
npm run api                 # tsx watch — http://localhost:$PORT (PORT from apps/api/.env, default 4000)
npm run web                 # next dev  — http://localhost:3000
```

Extra arguments are forwarded, e.g. `npm run web -- -p 3100`.

### Demo accounts (after seeding)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@skillforge.app` | `Password123` |
| Mentor | `mentor@skillforge.app` | `Password123` |
| Entrepreneur | `priya@skillforge.app` | `Password123` |

### Root scripts

| Script | Does |
| --- | --- |
| `npm run setup` | `npm ci` in `apps/api` and `apps/web` |
| `npm run dev` | API (`tsx watch`) and web (`next dev`) together |
| `npm run api` / `npm run web` | one app in dev mode |
| `npm run build` | `build:api` (tsc → `apps/api/dist`) then `build:web` (Netlify API bundle + `next build`) |
| `npm run start:api` / `npm run start:web` | run the production builds |
| `npm test` | API unit tests (Vitest) |
| `npm run db:generate` / `db:migrate` / `db:deploy` / `db:seed` / `db:studio` | Prisma CLI in `apps/api` |

There is no root `lint` script: neither app currently has a working ESLint
configuration (see [Troubleshooting](#troubleshooting)).

---

## Environment variables

| File | Used by | Template |
| --- | --- | --- |
| `apps/api/.env` | API process (dotenv, loaded from `apps/api`) and the Prisma CLI | [`apps/api/.env.example`](apps/api/.env.example) |
| `apps/web/.env.local` | Next.js (`next dev` / `next build`) | [`apps/web/.env.example`](apps/web/.env.example) |
| `.env` (root) | `docker compose` variable substitution only | [`.env.example`](.env.example) |

Key variables:

| Variable | App | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | api | Postgres connection string |
| `DIRECT_URL` | api | Required by `schema.prisma` (`directUrl`); same as `DATABASE_URL` unless using a pooler (Supabase) |
| `PORT`, `API_PREFIX` | api | Listen port (default 4000) and route prefix (default `/api/v1`) |
| `CLIENT_URL` | api | CORS origin — the web app's URL |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | api | Token signing secrets |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | api | Google login (optional) |
| `SMTP_*`, `MAIL_FROM` | api | Email delivery (optional; logged to console when unset) |
| `CLOUDINARY_*` | api | Avatar uploads (optional) |
| `NEXT_PUBLIC_API_URL` | web | API base URL the browser calls (baked in at build time) |
| `API_PROXY_TARGET` | web | Where `/api/*` is proxied when `NEXT_PUBLIC_API_URL` is relative |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | web | Newsletter form key (optional) |

Optional integrations are walked through in [INTEGRATIONS.md](INTEGRATIONS.md).

---

## API overview

Base URL: `/api/v1` (health check at `/health`). All responses use the envelope
`{ success, message, data, meta? }`; lists include `meta.pagination`.
Protected routes take `Authorization: Bearer <accessToken>`; the refresh token
travels in an httpOnly `refreshToken` cookie.

| Resource | Endpoints |
| --- | --- |
| `auth` | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/verify-otp`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/google`; `GET /auth/me` |
| `users` | `GET /users/skills`, `/users/interests`, `/users/me/profile`, `/users/me/dashboard`; `PUT /users/me/profile`, `/users/me/assessment`; `POST /users/me/avatar`; bookmarks, certificates, achievements under `/users/me/*` |
| `businesses` | `GET /businesses`, `/businesses/categories`, `/businesses/:slug`; `POST /businesses/recommend` |
| `roadmaps` | `GET /roadmaps/business/:businessId`, `/roadmaps/me`, `/roadmaps/me/:roadmapId`; `POST /roadmaps/:roadmapId/start`; `PATCH /roadmaps/me/steps/:userRoadmapStepId` |
| `learning` | `GET /learning/resources`, `/learning/resources/:slug`, `/learning/me/enrollments`, `/learning/me/certificates`; `POST /learning/resources/:id/enroll`; `PATCH /learning/me/lessons/:lessonProgressId` |
| `mentors` | `GET /mentors`, `/mentors/:id`, `/mentors/me/sessions`, `/mentors/me/dashboard`; `POST /mentors/apply`, `/mentors/:id/book`, `/mentors/sessions/:id/review`; `PATCH /mentors/sessions/:id/status` |
| `community` | `GET /community/posts`, `/community/posts/:slug`, `/community/tags/trending`; `POST /community/posts`, `/community/posts/:id/comments`, `/community/posts/:id/like`; `DELETE /community/posts/:id` |
| `notifications` | `GET /notifications`, `/notifications/unread-count`; `PATCH /notifications/read-all`, `/notifications/:id/read`; `DELETE /notifications/:id` |
| `admin` | `GET /admin/overview`, `/admin/users`, `/admin/mentors/pending`, `/admin/complaints`, `/admin/announcements`; `PATCH /admin/users/:id`, `/admin/mentors/:id/verify`, `/admin/content/{business,resource}/:id/status`, `/admin/complaints/:id`; `POST`/`DELETE /admin/announcements` |

Route definitions live in `apps/api/src/modules/*/*.route.ts`, mounted in
`apps/api/src/routes/index.ts`.

---

## Database, migrations and seed

Prisma lives in **`apps/api/prisma/`** (`schema.prisma`, `migrations/`, `seed.ts`).
It stays inside the API app on purpose: the Render service (`rootDir: apps/api`)
and the API Docker image (build context `apps/api`) both need it inside that
directory. The Netlify build copies `schema.prisma` into `apps/web/prisma/`
(git-ignored) and generates a client there for the serverless function.

```bash
npm run db:migrate    # create/apply migrations in development (prisma migrate dev)
npm run db:deploy     # apply existing migrations (prisma migrate deploy) — what Render/Docker run
npm run db:seed       # idempotent demo data
npm run db:studio     # Prisma Studio
```

---

## Testing

```bash
npm test              # = npm --prefix apps/api test  → vitest run, 9 tests across 2 files
```

Covers the business-idea recommendation scoring (`business.service.test.ts`) and
the password hashing helpers (`password.test.ts`). Neither needs a database.

The web app has no test suite; `npm run build:web` is the check that it compiles —
it type-checks and prerenders every route.

---

## Production build

```bash
npm run build         # apps/api/dist + apps/web/.next (standalone output)
npm run start:api     # node dist/index.js
npm run start:web     # next start
```

`build:web` also runs `apps/web/scripts/prepare-api.mjs`, which needs
`apps/api/node_modules` installed (it bundles `apps/api/src/app.ts` for Netlify).

---

## Deployment

Full walkthroughs are in **[DEPLOYMENT.md](DEPLOYMENT.md)**.

| Target | Config | What it builds |
| --- | --- | --- |
| **Render** (Blueprint) | `render.yaml` | Postgres + `skillforge-api` (`rootDir: apps/api`) + `skillforge-web` (`rootDir: apps/web`) |
| **Netlify** | `netlify.toml` | `base = apps/web`; web app + the API as a serverless function; database elsewhere (e.g. Supabase) |
| **Docker** | `docker-compose.yml`, `apps/*/Dockerfile` | `db` + `api` (port 4000) + `web` (port 3000) |

```bash
cp .env.example .env
docker compose up --build
```

---

## Troubleshooting

- **`Environment variable not found: DIRECT_URL`** — `schema.prisma` declares a
  `directUrl`. Set `DIRECT_URL` (same value as `DATABASE_URL` for plain Postgres).
- **Web loads but API calls fail with a relative `NEXT_PUBLIC_API_URL`** — the
  dev/prod proxy targets `API_PROXY_TARGET` (default `http://localhost:4055`).
  Set it to wherever the API listens, or use an absolute `NEXT_PUBLIC_API_URL`.
  Both are read at build/start time, so restart or rebuild after changing them.
- **CORS errors** — `CLIENT_URL` on the API must equal the web app's origin.
- **`npm run build:web` fails in `prepare-api.mjs`** — install the API's
  dependencies first (`npm --prefix apps/api ci`).
- **`npm run lint` in either app fails** — pre-existing: ESLint 9 is installed but
  `apps/api` has no `eslint.config.*`, and `next lint` in `apps/web` has no config and
  prompts interactively.
- **Prisma engine errors in Alpine Docker images** — the API image installs
  `openssl` so Prisma selects the OpenSSL 3 engine; keep that line if you edit the Dockerfile.

---

## License

MIT © 2026 SkillForge — Designed & Developed by **Saatwik Sairaam Vasamsetti**. All Rights Reserved.
