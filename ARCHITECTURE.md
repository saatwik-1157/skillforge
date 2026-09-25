# SkillForge — Software Architecture

> _"Turn Skills Into Successful Businesses."_
> Designed & Developed by **V. Saatwik Sairaam**

This document describes the system architecture, folder structure, and the
engineering conventions every module in the codebase follows.

---

## 1. High-Level Architecture

SkillForge is a **decoupled full-stack platform** split into two deployable
applications that share a typed contract:

```
                    ┌────────────────────────────────────────────┐
                    │                 Browser                      │
                    │   Next.js 15 (App Router) · React 19 · TS    │
                    │   Tailwind · shadcn/ui · Framer Motion       │
                    └───────────────┬──────────────────────────────┘
                                    │  HTTPS / JSON (Bearer access token)
                                    ▼
                    ┌────────────────────────────────────────────┐
                    │              API Gateway (Express)           │
                    │  Helmet · CORS · Rate-limit · Request-ID     │
                    └───────────────┬──────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
  Middleware layer           Module layer               Cross-cutting
  - auth (JWT verify)     auth · user · business      - logger (pino)
  - rbac (role guard)     roadmap · learning ·        - mailer (email)
  - validate (zod)        mentor · community ·        - storage (Cloudinary)
  - error handler         notification · admin        - jwt / password utils
        │                           │
        └───────────────────────────┼
                                     ▼
                          ┌────────────────────┐
                          │   Repository layer  │
                          │   (Prisma Client)   │
                          └─────────┬──────────┘
                                    ▼
                          ┌────────────────────┐
                          │     PostgreSQL      │
                          └────────────────────┘
```

### Layered / Clean Architecture

Each backend feature is a **module** with the same internal layering. Data flows
strictly inward; dependencies point in one direction:

```
route  ->  controller  ->  service  ->  repository  ->  Prisma  ->  DB
 (HTTP)     (I/O map)      (business    (data access)
                            rules)
```

- **Route** — declares HTTP endpoints, attaches middleware (auth, rbac, validate).
- **Controller** — thin; parses the request, calls a service, shapes the response.
  Contains **no business logic**.
- **Service** — the heart of the module. Owns business rules, orchestration,
  transactions. Knows nothing about `req`/`res`.
- **Repository** — the only layer that talks to Prisma. Encapsulates queries so
  services stay persistence-agnostic (Repository Pattern).

This satisfies **SOLID**: each layer has a single responsibility, services depend
on repository abstractions, and modules are open for extension (new modules) but
closed for modification (shared core is stable).

---

## 2. Folder Structure

```
skillforge/
├── ARCHITECTURE.md            # this document
├── README.md                  # setup, deploy, API overview
├── docker-compose.yml         # postgres + api + web
├── render.yaml · netlify.toml # deploy configs
├── package.json               # root scripts (delegate to each app via npm --prefix)
├── .env.example               # docker compose variables
│
├── apps/api/                  # Express + TypeScript + Prisma API
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma      # single source of truth for the data model
│   │   ├── migrations/
│   │   └── seed.ts            # demo users, businesses, mentors, roadmaps...
│   └── src/
│       ├── index.ts           # process entry (starts http server)
│       ├── app.ts             # express app assembly (middleware + routes)
│       ├── config/
│       │   ├── env.ts         # validated environment variables
│       │   └── prisma.ts      # singleton PrismaClient
│       ├── middleware/
│       │   ├── auth.middleware.ts     # verify access token -> req.user
│       │   ├── rbac.middleware.ts     # requireRole(...roles)
│       │   ├── validate.middleware.ts # zod schema guard
│       │   ├── rateLimit.middleware.ts
│       │   └── error.middleware.ts    # central error -> ApiResponse
│       ├── utils/
│       │   ├── ApiError.ts
│       │   ├── ApiResponse.ts
│       │   ├── asyncHandler.ts
│       │   ├── jwt.ts
│       │   ├── password.ts
│       │   ├── logger.ts
│       │   ├── mailer.ts
│       │   ├── pagination.ts
│       │   └── cloudinary.ts
│       ├── modules/
│       │   ├── auth/          # register, login, refresh, otp, google
│       │   ├── user/          # profile, skills, assessment, readiness score
│       │   ├── business/      # ideas, detail, recommendation engine
│       │   ├── roadmap/       # steps, per-user progress
│       │   ├── learning/      # resources, lessons, enrollments, certificates
│       │   ├── mentor/        # profiles, sessions, reviews
│       │   ├── community/     # posts, comments, likes
│       │   ├── notification/  # in-app notifications
│       │   └── admin/         # users, content approval, complaints, analytics
│       │        each module = { *.route.ts, *.controller.ts,
│       │                        *.service.ts, *.repository.ts, *.schema.ts }
│       └── routes/
│           └── index.ts       # mounts every module router under /api/v1
│
└── apps/web/                  # Next.js 15 (App Router) frontend
    ├── package.json
    ├── tsconfig.json
    ├── next.config.mjs        # standalone output + /api/* dev proxy
    ├── tailwind.config.ts     # orange + navy + white design tokens
    ├── Dockerfile
    ├── .env.example
    ├── netlify/functions/     # api.js — Express API as a Netlify Function
    ├── scripts/prepare-api.mjs # bundles ../api/src/app.ts for that function
    └── src/
        ├── app/               # routes (landing, auth, dashboards, ...)
        │   ├── layout.tsx     # root layout (theme provider + footer)
        │   ├── globals.css
        │   └── page.tsx       # landing page
        ├── components/
        │   ├── ui/            # shadcn primitives (button, card, input...)
        │   ├── layout/        # Navbar, Footer, ThemeToggle
        │   ├── landing/       # Hero, Stats, HowItWorks, Testimonials...
        │   └── shared/        # reusable widgets, empty states, skeletons
        ├── lib/
        │   ├── api.ts         # typed fetch client (attaches access token)
        │   ├── auth.ts        # client auth store / helpers
        │   └── utils.ts       # cn(), formatters
        └── hooks/             # useAuth
```

### One module, one shape

Every backend module folder contains the same five files so the codebase is
predictable:

| File               | Responsibility                                        |
| ------------------ | ----------------------------------------------------- |
| `*.route.ts`       | HTTP endpoints + middleware wiring                    |
| `*.controller.ts`  | Request/response mapping (thin)                        |
| `*.service.ts`     | Business logic, orchestration, transactions            |
| `*.repository.ts`  | Prisma queries (the only place Prisma is imported)     |
| `*.schema.ts`      | Zod validation schemas + inferred DTO types            |

---

## 3. Authentication & Authorization

- **Passwords** hashed with `bcrypt` (cost 12). OAuth-only accounts have a null hash.
- **Access token** — short-lived JWT (15 min), sent as `Authorization: Bearer`.
- **Refresh token** — long-lived (7 days), rotated on use, stored hashed in
  `refresh_tokens`, revocable per-device. Delivered via httpOnly cookie.
- **OTP** — email verification & password reset codes hashed in `otp_tokens`.
- **Google Login** — verified server-side; links/creates a user by `googleId`.
- **RBAC** — `requireRole(...)` middleware guards routes; roles are
  `VISITOR | ENTREPRENEUR | MENTOR | ADMIN`.

---

## 4. Cross-Cutting Concerns

- **Validation** — every request body/query validated with **Zod** before it
  reaches a controller; invalid input becomes a `422` `ApiError`.
- **Error handling** — controllers wrap async logic in `asyncHandler`; all errors
  funnel to one `error.middleware` producing a consistent `ApiResponse` envelope.
- **Response envelope** — `{ success, message, data, meta }`. Lists carry
  `meta.pagination`.
- **Security** — Helmet headers, CORS allowlist, per-route rate limiting,
  input sanitization, secure signed cookies, and RBAC on every privileged route.
- **Observability** — structured `pino` logs with a per-request `x-request-id`.

---

## 5. Scalability Notes (built for 1M users)

- **Stateless API** — no server-side session; horizontally scalable behind a load
  balancer. Refresh-token state lives in Postgres, not memory.
- **DB** — normalized schema, indexed foreign keys and hot query paths, cursor/
  offset pagination on every list endpoint.
- **Caching-ready** — service layer is the natural seam to add Redis for hot
  reads (recommendations, trending posts) without touching controllers.
- **Media offloaded** — user uploads go to Cloudinary, not the app server.
- **Stateless containers** — API and web ship as separate Docker images and scale
  independently via `docker-compose` (or k8s in production).

---

## 6. Testing Strategy

- **Implemented today** — Vitest unit tests in `apps/api` for the recommendation
  scoring (`business.service.test.ts`) and password helpers (`password.test.ts`).
- **Planned, not yet present** — route-level integration tests against a test
  Postgres, and end-to-end auth + business + roadmap happy paths.

See `README.md` for commands.
