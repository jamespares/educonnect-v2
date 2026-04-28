# EduConnect v2

Cloudflare-native teacher recruitment platform for China. Built with **Hono**, **React**, **D1**, **Drizzle ORM**, and **Tailwind CSS**.

## Architecture

- **Frontend:** React SPA (Vite + Tailwind + React Router)
- **Backend:** Hono API running on Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite) with Drizzle ORM
- **File Storage:** Cloudflare R2 (for CVs, headshots, videos)
- **Auth:** Custom cookie-based sessions (no third parties)
- **Payments:** Stripe (teacher access fees)

## Project Structure

```
educonnect-v2/
├── src/
│   ├── server/          # Hono API
│   │   ├── index.ts
│   │   ├── auth.ts
│   │   └── routes/
│   ├── client/          # React SPA
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   └── lib/
│   └── db/              # Drizzle schema
│       ├── schema.ts
│       └── index.ts
├── migrations/          # D1 migration files
├── public/              # Static assets
├── scripts/             # Seed scripts
├── wrangler.toml
├── vite.config.ts
└── drizzle.config.ts
```

## Quick Start

### 1. Install dependencies

```bash
cd educonnect-v2
npm install
```

### 2. Create D1 database

```bash
npx wrangler d1 create educonnect-db
```

Copy the `database_id` into `wrangler.toml`.

### 3. Run migrations

```bash
npx wrangler d1 migrations apply educonnect-db --local
```

### 4. Set secrets

```bash
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put SESSION_SECRET
```

### 5. Start development

```bash
npm run dev
```

This starts:
- Vite dev server on http://localhost:5173 (React SPA)
- Hono worker on http://localhost:8787 (API)
- Vite proxies `/api` requests to the worker automatically

### 6. Build & deploy

```bash
npm run build
npm run deploy
```

## Features

### Landing Pages
- `/teachers` — Teacher-facing landing page
- `/schools` — School-facing landing page

### Auth
- `/login` — Unified login
- `/register` — Role selection (teacher or school)
- Custom session cookies stored in D1

### Teacher Flow
- Complete profile (subjects, experience, preferred cities)
- Browse jobs at `/jobs`
- Apply to jobs with one click
- Track applications on `/teacher-dashboard`

### School Flow
- Complete school profile
- Post jobs from `/profile`
- Review applicants on `/school-dashboard`
- Update application status (pending → interview → offer → placed)

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Unified auth (email, password hash, role) |
| `teacher_profiles` | Teacher details |
| `school_profiles` | School details |
| `jobs` | Job postings |
| `applications` | Teacher applications to jobs |
| `sessions` | Cookie session tokens |

## Seeding Research Data

The project includes 278 scraped jobs from `EduConnect Research/`. To import them:

1. Adapt `scripts/seed-jobs.ts` to insert via Drizzle ORM
2. Or generate SQL INSERTs and run:
   ```bash
   npx wrangler d1 execute educonnect-db --local --file=./seed.sql
   ```

## Auth Flow

1. User registers with email + password + role
2. Password hashed with PBKDF2 (Web Crypto API)
3. Session token generated and stored in `sessions` table
4. HTTP-only cookie set with session token
5. All protected routes validate the session cookie against D1

## Environment Variables

| Variable | Source | Purpose |
|----------|--------|---------|
| `DB` | `wrangler.toml` binding | D1 database |
| `BUCKET` | `wrangler.toml` binding | R2 file storage |
| `STRIPE_SECRET_KEY` | `wrangler secret` | Stripe payments |
| `SESSION_SECRET` | `wrangler secret` | Session signing (future) |

## Tech Decisions

- **No third-party auth** — Custom session-based auth in D1 keeps everything edge-native and simple.
- **SQLite over PostgreSQL** — D1's automatic read replicas and zero-latency queries from Workers make it ideal for a read-heavy job board.
- **Hono over FastAPI** — Hono is purpose-built for edge runtimes. One codebase, no Python environment needed.
- **Unified Worker** — API and static assets served from one Cloudflare Worker for simplicity.

## Roadmap

- [x] Core auth (register, login, logout, sessions)
- [x] Teacher + School profiles
- [x] Job board (public browse + search)
- [x] Applications (apply + status tracking)
- [x] Dual dashboards
- [ ] Stripe payment integration
- [ ] File uploads (R2 presigned URLs)
- [ ] Email notifications
- [ ] Seed research data
- [ ] Admin dashboard
