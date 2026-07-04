# 🔥 SkillForge

> **Turn Skills Into Successful Businesses.**
>
> An end-to-end entrepreneurship enablement platform. Discover business ideas
> from your skills and budget, learn the essentials, follow a step-by-step
> roadmap, connect with mentors, and launch your micro-enterprise.
>
> **Designed & Developed by V. Saatwik Sairaam.**

![stack](https://img.shields.io/badge/Next.js-15-black) ![react](https://img.shields.io/badge/React-19-149eca) ![node](https://img.shields.io/badge/Express-4-000000) ![db](https://img.shields.io/badge/PostgreSQL-16-336791) ![orm](https://img.shields.io/badge/Prisma-5-2d3748) ![license](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

| Area | What's included |
| --- | --- |
| **Landing** | Animated hero, stats, how-it-works, categories, testimonials, FAQ, newsletter, dark mode, fully responsive |
| **Auth** | Register, login, JWT + rotating refresh tokens, OTP email verification, password reset, Google login, RBAC |
| **Entrepreneur** | Profile, skill/interest assessment, **business readiness score**, dashboard, bookmarks, certificates, achievements |
| **Recommendation engine** | Scores 150+ business ideas against your skills, budget, time & type |
| **Business detail** | Overview, SWOT, investment breakdown, licenses, marketing strategy, risks, revenue model, lean canvas, checklist |
| **Roadmap** | Interactive step-by-step journey with per-user progress tracking |
| **Learning** | Courses, lessons, enrollments, progress, auto-issued certificates |
| **Mentors** | Profiles, verification, session booking, reviews & ratings, mentor dashboard |
| **Community** | Forum posts, threaded comments, likes, trending tags, success stories |
| **Notifications** | In-app notifications + email |
| **Admin** | Users, content approval, mentor verification, complaints, announcements, analytics |

See **[ARCHITECTURE.md](ARCHITECTURE.md)** for the full system design, folder
structure, and engineering conventions.

---

## 🏗️ Tech Stack

**Frontend** — Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS ·
shadcn-style UI · Framer Motion · Lucide · next-themes · Zustand

**Backend** — Node.js · Express · TypeScript · Prisma ORM · PostgreSQL · Zod ·
JWT · bcrypt · Helmet · Cloudinary · Nodemailer · Pino

**Ops** — Docker · Docker Compose

---

## 📁 Monorepo Layout

```
skillforge/
├── server/     # Express + Prisma API   (see server/src/modules/*)
├── client/     # Next.js 15 web app      (see client/src/app/*)
├── docker-compose.yml
├── ARCHITECTURE.md
└── README.md
```

Each backend module follows the same shape:
`*.route.ts → *.controller.ts → *.service.ts → *.repository.ts` + `*.schema.ts`.

---

## 🚀 Getting Started

> **Prerequisite:** Node.js 20+ and npm must be installed, plus either a local
> PostgreSQL 16 or Docker. (This repo was authored without a local Node
> toolchain, so run the install/generate/migrate steps below on your machine to
> produce `node_modules` and the generated Prisma client before first run.)

### Option A — Docker (everything at once)

```bash
cp .env.example .env          # fill in secrets
docker compose up --build     # db + api + web
# API  → http://localhost:4000/api/v1
# Web  → http://localhost:3000
```

### Option B — Local dev

```bash
# 1) Database (Docker just for Postgres)
docker compose up -d db

# 2) API
cd server
cp ../.env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed                  # demo users, businesses, mentors, roadmaps
npm run dev                   # http://localhost:4000

# 3) Web (new terminal)
cd client
npm install
npm run dev                   # http://localhost:3000
```

### Demo accounts (after seeding)

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@skillforge.app` | `Password123` |
| Mentor | `mentor@skillforge.app` | `Password123` |
| Entrepreneur | `priya@skillforge.app` | `Password123` |

---

## 🔑 Environment Variables

All variables are documented in [`.env.example`](.env.example). Key ones:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Token signing secrets |
| `GOOGLE_CLIENT_ID` | Google OAuth (optional) |
| `SMTP_*` | Email delivery (falls back to console logging in dev) |
| `CLOUDINARY_*` | Media uploads (optional) |
| `NEXT_PUBLIC_API_URL` | API base URL the client calls |

---

## 🧪 Testing

```bash
cd server
npm test          # vitest — recommendation scoring + auth utils
```

---

## 📡 API Overview

Base URL: `/api/v1`. All responses use the envelope
`{ success, message, data, meta? }`. Lists include `meta.pagination`.

| Resource | Example endpoints |
| --- | --- |
| `auth` | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/google`, `/auth/verify-otp` |
| `users` | `GET /users/me/dashboard`, `PUT /users/me/assessment`, `POST /users/me/bookmarks` |
| `businesses` | `GET /businesses`, `GET /businesses/:slug`, `POST /businesses/recommend` |
| `roadmaps` | `POST /roadmaps/:id/start`, `PATCH /roadmaps/me/steps/:id` |
| `learning` | `POST /learning/resources/:id/enroll`, `PATCH /learning/me/lessons/:id` |
| `mentors` | `GET /mentors`, `POST /mentors/:id/book`, `POST /mentors/sessions/:id/review` |
| `community` | `GET /community/posts`, `POST /community/posts/:id/like` |
| `notifications` | `GET /notifications`, `PATCH /notifications/read-all` |
| `admin` | `GET /admin/overview`, `PATCH /admin/mentors/:id/verify` |

---

## 🔐 Security

Password hashing (bcrypt) · short-lived access + rotating refresh tokens ·
httpOnly cookies · Helmet headers · CORS allowlist · per-route rate limiting ·
Zod input validation · role-based access control · secure Cloudinary uploads.

---

## 📜 License

MIT © 2026 SkillForge — Designed & Developed by **V. Saatwik Sairaam**. All Rights Reserved.
