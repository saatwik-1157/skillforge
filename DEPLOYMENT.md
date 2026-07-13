# Deploying SkillForge

SkillForge is a full app (Next.js web + Express API + PostgreSQL), so it needs a
host that can run a Node server and a database — **not** a static host like
Netlify or GitHub Pages. This guide uses **Render**, where one Blueprint file
(`render.yaml`) provisions the database, the API, and the web app together.

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
- **Prefer Vercel for the frontend?** Deploy `client/` to Vercel instead: set
  `NEXT_PUBLIC_API_URL` to the Render API URL, and set the API's `CLIENT_URL`
  to your Vercel domain. Keep the API + database on Render.

---

## Option B — Frontend on Netlify (+ API & database on Render)

Netlify can host the **web app**, but not the API or database — so keep those on
Render and point Netlify at them. (`netlify.toml` in this repo is already set up.)

1. **API + database on Render.** Follow Steps 1–2 above, but you only need the
   `skillforge-db` and `skillforge-api` services (you can delete the
   `skillforge-web` service in the Blueprint, or just ignore it). Note the API
   URL, e.g. `https://skillforge-api.onrender.com`.
2. **Frontend on Netlify.** Netlify → **Add new site** → **Import from Git** →
   pick the repo. Netlify reads `netlify.toml` (base = `client`) and detects
   Next.js automatically.
3. **Set the API URL on Netlify:** Site settings → Environment variables →
   `NEXT_PUBLIC_API_URL = https://skillforge-api.onrender.com/api/v1` → then
   **Trigger deploy** → **Clear cache and deploy site**.
4. **Allow the Netlify origin on the API (CORS):** on the Render `skillforge-api`
   service, set `CLIENT_URL = https://<your-site>.netlify.app` and let it restart.
5. Open your Netlify URL and log in with the demo accounts above.

> Why the split? Netlify runs static pages + short serverless functions — it has
> nowhere to run a persistent Express server or a PostgreSQL database. The API and
> database must live on a host built for that (Render, Railway, Fly, etc.).
- **Custom domain:** add it on the `skillforge-web` service, then update the
  API's `CLIENT_URL` to match.

---

Designed & Developed by **V. Saatwik Sairaam**.
