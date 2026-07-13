# SkillForge — Production Integrations Checklist

SkillForge runs **fully without any of these** — they only unlock extra features.
Set them as environment variables on the **`skillforge-api`** service in Render
(Dashboard → the service → **Environment**), unless a row says otherwise. After
changing API env vars the service auto-restarts; changing the one `NEXT_PUBLIC_*`
var requires a **web** rebuild (see note at the bottom).

> Values marked `sync: false` / left blank in `render.yaml` are the ones you fill
> in here. Secrets: never commit real values — `server/.env` is git-ignored.

---

## ✅ Already handled by `render.yaml` (required — nothing to do)

- [x] `DATABASE_URL` — auto-wired from the `skillforge-db` Postgres
- [x] `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — auto-generated
- [x] `CLIENT_URL` — you set this once to the web URL (Deploy step 3)
- [x] `NEXT_PUBLIC_API_URL` — you set this once to the API URL (Deploy step 3)

The three sections below are **all optional.**

---

## 1. ✉️ Email (SMTP) — verification & notification emails

**If unset:** emails are not sent — they're logged to the API server logs instead.
Sign-up, login, and the app all still work; users just won't receive real email.

**To enable (any SMTP provider — e.g. [Resend](https://resend.com),
[SendGrid](https://sendgrid.com), [Mailgun](https://mailgun.com), Gmail app password):**

Set on **`skillforge-api`**:

| Var | Example | Notes |
| --- | --- | --- |
| `SMTP_HOST` | `smtp.resend.com` | provider's SMTP host |
| `SMTP_PORT` | `587` | `587` (STARTTLS) or `465` (TLS) |
| `SMTP_USER` | `resend` / your username | provider login |
| `SMTP_PASS` | `••••••••` | SMTP password / API key |
| `MAIL_FROM` | `SkillForge <no-reply@yourdomain.com>` | verified sender address |

- [ ] Provider account created & sender/domain verified
- [ ] 5 vars above set on `skillforge-api`
- [ ] Sent a test (register a new user → confirm the email arrives)

> Email only turns on when **both** `SMTP_HOST` and `SMTP_USER` are set.

---

## 2. 🖼️ Cloudinary — profile-image / avatar uploads

**If unset:** image upload endpoints are disabled; avatars fall back to generated
placeholders. Everything else works.

**To enable ([cloudinary.com](https://cloudinary.com) — free tier is fine):**

Set on **`skillforge-api`** (find these on the Cloudinary dashboard home):

| Var | Where to find it |
| --- | --- |
| `CLOUDINARY_CLOUD_NAME` | Dashboard → "Cloud name" |
| `CLOUDINARY_API_KEY` | Dashboard → "API Key" |
| `CLOUDINARY_API_SECRET` | Dashboard → "API Secret" (keep secret) |

- [ ] Cloudinary account created
- [ ] 3 vars above set on `skillforge-api`
- [ ] Uploaded a profile image in the app to confirm

---

## 3. 🔑 Google Login (OAuth)

**If unset:** the "Sign in with Google" button is inactive; email/password login
works normally.

**To enable ([Google Cloud Console](https://console.cloud.google.com) →
APIs & Services → Credentials → Create OAuth client ID → *Web application*):**

- **Authorized JavaScript origins:** your web URL, e.g.
  `https://skillforge-web.onrender.com`
- **Authorized redirect URIs:** add your web URL (and
  `.../login` if your provider needs the exact callback)

Then set:

| Var | Service | Value |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID` | `skillforge-api` | the OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | `skillforge-api` | the OAuth client secret |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `skillforge-web` | the **same** client ID (public) |

- [ ] OAuth client created with the correct origins/redirects
- [ ] `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` set on `skillforge-api`
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` set on `skillforge-web`
- [ ] Rebuilt the web service (see note) and tested the Google button

---

## ⚠️ Note on the web (`NEXT_PUBLIC_*`) variables

Anything starting with `NEXT_PUBLIC_` (the API URL and the Google client ID) is
**baked into the build**, not read at runtime. After changing one on
`skillforge-web`, do **Manual Deploy → Clear build cache & deploy** — a plain
restart won't pick it up.

---

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the core deploy steps and
[`.env.example`](./.env.example) for the full variable list.
