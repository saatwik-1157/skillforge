# Deploying SkillForge

SkillForge is a full app (Next.js web + Express API + PostgreSQL). The code is a
monorepo: the API is `apps/api` and the web app is `apps/web`; each deploy target
builds one of those directories. This guide uses **Render**, where one Blueprint file
(`render.yaml`) provisions the database, the API (`rootDir: apps/api`), and the web
app (`rootDir: apps/web`) together. Netlify (Option B) and Docker Compose are also
supported.

> **Existing Render services:** `rootDir` in `render.yaml` only reaches services that
> are managed by the Blueprint. If a service was created by hand, open it →
> **Settings → Build & Deploy → Root Directory** and set `apps/api` / `apps/web`.

> Everything below is free-tier friendly. Free services sleep after inactivity
> and take ~30s to wake on the first request — fine for a demo/portfolio.

---

## Step 1 — Put the code on GitHub

Render deploys from a Git repo. From the project folder:

```bash
# create a new EMPTY repo on github.com first (no README), then:
git remote add origin https://github.com/<your-username>/skillforge.git
git branch -M main
git push -u origin main
```

(If you have the GitHub CLI: `gh repo create skillforge --public --source=. --push`.)

---

## Step 2 — Create the Blueprint on Render

1. Sign up at **https://render.com** (free) and connect your GitHub.
2. Dashboard → **New** → **Blueprint**.
3. Pick your `skillforge` repo. Render reads `render.yaml` and shows a plan:
   - **skillforge-db** — PostgreSQL
   - **skillforge-api** — the Express API
   - **skillforge-web** — the Next.js app
4. Click **Apply**. The database and API build first. (The API's start command
   runs migrations and seeds demo data automatically.)

---

## Step 3 — Wire the two services together

Two URLs aren't known until the services exist, so set them after the first deploy.
Your URLs will look like `https://skillforge-api.onrender.com` and
`https://skillforge-web.onrender.com` (Render shows the exact names).

**On `skillforge-api`** → Environment → add/update:

| Key | Value |
| --- | --- |
| `CLIENT_URL` | `https://skillforge-web.onrender.com` |

Save (the API restarts). This lets the browser talk to the API (CORS).

**On `skillforge-web`** → Environment → add/update:

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://skillforge-api.onrender.com/api/v1` |

This value is **baked in at build time**, so after saving, open the web service →
**Manual Deploy** → **Clear build cache & deploy**.

---

## Step 4 — Open your live site

Visit `https://skillforge-web.onrender.com`. Log in with the seeded demo
accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@skillforge.app` | `Password123` |
| Mentor | `mentor@skillforge.app` | `Password123` |
| Entrepreneur | `priya@skillforge.app` | `Password123` |

---

## Notes & options

- **Speed up cold starts:** once seeded, edit `render.yaml` and remove
  `&& npm run seed` from the API `startCommand` (migrations still run).
- **Real email / uploads / Google login (all optional):** the app runs fine
  without them. To turn them on, follow **[`INTEGRATIONS.md`](./INTEGRATIONS.md)** —
  a per-integration checklist (SMTP, Cloudinary, Google OAuth) with where to get
  each key and which service to set it on.
- **Prefer Vercel for the frontend?** Deploy `apps/web/` (set it as the Vercel
  project's Root Directory) instead: set
  `NEXT_PUBLIC_API_URL` to the Render API URL, and set the API's `CLIENT_URL`
  to your Vercel domain. Keep the API + database on Render.

---

## Option B — Netlify (web app + API function; database elsewhere)

`netlify.toml` deploys the **web app and the Express API together**: the API is
bundled into a Netlify Function (`apps/web/netlify/functions/api.js`, built by
`apps/web/scripts/prepare-api.mjs`) and `/api/*` is redirected to it. Netlify has
no database, so point `DATABASE_URL` at a hosted Postgres (the config was written
for Supabase).

1. **Database.** Create a Postgres (e.g. Supabase) and apply the migrations from
   your machine: in `apps/api/.env` set `DATABASE_URL` / `DIRECT_URL` to it, then
   `npm run db:deploy && npm run db:seed` from the repo root.
2. **Site.** Netlify → **Add new site** → **Import from Git** → pick the repo.
   Netlify reads `netlify.toml`: `base = "apps/web"`, build command
   `cd ../api && npm install … && cd ../web && npm run build`, publish `.next`.
   If the site already exists, check **Site configuration → Build & deploy →
   Base directory** is `apps/web` (or empty so the toml value applies).
3. **Environment variables** (Site configuration → Environment variables):
   `DATABASE_URL` (pooler string), `DIRECT_URL` (direct/session string),
   `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV=production`.
   `NEXT_PUBLIC_API_URL=/api/v1` is already set in `netlify.toml`.
4. Deploy, then open the site and log in with the demo accounts above.

> Alternative: host only the web app on Netlify and keep the API on Render. That
> needs `netlify.toml` changes — remove the `/api/*` redirect and set
> `NEXT_PUBLIC_API_URL` to the Render API URL (values in `[build.environment]`
> override the dashboard), and set the API's `CLIENT_URL` to the Netlify origin.

- **Custom domain:** add it on the `skillforge-web` service, then update the
  API's `CLIENT_URL` to match.

---

Designed & Developed by **V. Saatwik Sairaam**.
