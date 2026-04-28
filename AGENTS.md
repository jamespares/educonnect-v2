# EduConnect v2 — Agent Guide

> Cloudflare-native teacher recruitment platform for China. Built with Hono, React, D1, Drizzle ORM, and Tailwind CSS.

---

## Project Overview

EduConnect v2 connects international teachers with schools in China. It is a full-stack web application deployed entirely on Cloudflare's edge infrastructure.

**Key characteristics:**
- Single Cloudflare Worker serves both the API and the React SPA static assets.
- No third-party auth provider — custom cookie-based session auth stored in D1.
- SQLite (D1) is used for all relational data; R2 is used for file uploads (CVs, headshots, videos).
- Stripe handles one-time teacher access payments.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, React Router DOM 7, Vite 6, Tailwind CSS 4 |
| Backend | Hono 4 (Cloudflare Workers runtime) |
| Database | Cloudflare D1 (SQLite) |
| ORM | Drizzle ORM 0.41 + Drizzle Kit 0.30 |
| File Storage | Cloudflare R2 |
| Payments | Stripe Node SDK 17 |
| Validation | Zod 3 + `@hono/zod-validator` |
| Language | TypeScript 5.7 (ES modules) |

---

## Project Structure

```
educonnect-v2/
├── src/
│   ├── server/
│   │   ├── index.ts          # Hono app entry point; mounts routes + SPA fallback
│   │   ├── auth.ts           # Password hashing, sessions, auth middleware
│   │   └── routes/           # Domain API routes (Hono sub-routers)
│   │       ├── auth.ts
│   │       ├── teachers.ts
│   │       ├── schools.ts
│   │       ├── jobs.ts
│   │       ├── applications.ts
│   │       ├── upload.ts
│   │       └── payments.ts
│   ├── client/
│   │   ├── main.tsx          # React root render (StrictMode + BrowserRouter)
│   │   ├── App.tsx           # Route definitions + AuthContext provider
│   │   ├── index.html        # HTML shell
│   │   ├── index.css         # Tailwind v4 import + custom theme
│   │   ├── lib/
│   │   │   ├── api.ts        # Typed fetch wrapper for all backend APIs
│   │   │   └── upload.ts     # File upload helper (FormData → /api/upload)
│   │   └── pages/            # Page-level React components
│   │       ├── LandingTeacher.tsx
│   │       ├── LandingSchool.tsx
│   │       ├── Login.tsx
│   │       ├── Register.tsx
│   │       ├── Profile.tsx
│   │       ├── Jobs.tsx
│   │       ├── JobDetail.tsx
│   │       ├── TeacherDashboard.tsx
│   │       └── SchoolDashboard.tsx
│   └── db/
│       ├── schema.ts         # Drizzle table definitions + inferred types
│       └── index.ts          # `createDb(d1)` factory
├── migrations/               # D1 SQL migration files
├── scripts/                  # One-off data scripts (seed generation)
├── public/                   # Static assets copied to dist/
├── wrangler.toml             # Cloudflare Workers config + bindings
├── vite.config.ts            # Vite config (root: src/client, proxy /api)
├── drizzle.config.ts         # Drizzle Kit config (d1-http driver)
├── tsconfig.json             # Shared TypeScript config
└── package.json
```

---

## Build and Development Commands

```bash
# Install dependencies
npm install

# Development: runs Vite dev server (localhost:5173) + wrangler dev (localhost:8787)
# Vite proxies /api requests to the worker automatically.
npm run dev

# Type check (no emit)
npm run typecheck

# Production build: tsc + vite build → dist/
npm run build

# Deploy to Cloudflare Workers
npm run deploy
```

### Database Commands

```bash
# Generate Drizzle migrations from schema changes
npm run db:generate

# Apply migrations to local D1
npm run db:migrate:local

# Apply migrations to production D1
npm run db:migrate:prod

# Open Drizzle Studio (requires .env with Cloudflare credentials)
npm run db:studio
```

### Seeding Research Data

```bash
# Generate seed.sql from ../EduConnect Research/china_schools_all_jobs.csv
npx tsx scripts/generate-seed-sql.ts

# Execute against local D1
npx wrangler d1 execute educonnect-db --local --file=./seed.sql
```

---

## Runtime Architecture

### Unified Worker

A single Cloudflare Worker (`src/server/index.ts`) handles:
1. **API routes** under `/api/*` — Hono routers.
2. **Static assets** — In production, `c.env.ASSETS` (Workers Assets binding) serves files from `dist/`.
3. **SPA fallback** — Any non-API path returns `index.html` so React Router can handle client-side routing. In local dev, a fallback HTML shell is returned because `ASSETS` is unavailable.

### Local Dev Ports

| Service | URL |
|---------|-----|
| Vite dev server | http://localhost:5173 |
| Hono API (wrangler dev) | http://localhost:8787 |

Vite proxies `/api` to `localhost:8787`, so the frontend talks to the same origin in development.

### Cloudflare Bindings (`wrangler.toml`)

| Binding | Type | Purpose |
|---------|------|---------|
| `DB` | D1 Database | SQLite database via Drizzle ORM |
| `BUCKET` | R2 Bucket | File storage for uploads |
| `ASSETS` | Workers Assets | Static file serving from `dist/` |

### Secrets (set via `wrangler secret put`)

- `STRIPE_SECRET_KEY` — Stripe API key
- `SESSION_SECRET` — Reserved for future session signing (not currently used)

### Public Vars (in `wrangler.toml`)

- `STRIPE_PUBLISHABLE_KEY` — Passed to frontend for Stripe.js

---

## Code Organization Conventions

### Backend

- **Routes**: Each domain lives in `src/server/routes/<domain>.ts` as an independent `Hono` router, then mounted in `src/server/index.ts` with `app.route('/api/<domain>', ...)`. 
- **Validation**: Incoming JSON is validated with `@hono/zod-validator` using Zod schemas defined at the top of each route file.
- **Auth**: `requireAuth` and `requireRole(...)` middleware are defined in `src/server/auth.ts`. They read the `session` cookie, look it up in D1, and attach the user to the context.
- **DB access**: Always call `createDb(c.env.DB)` inside the handler to get a Drizzle instance scoped to the request.
- **Passwords**: Hashed with PBKDF2 (100,000 iterations, SHA-256) via the Web Crypto API. Stored as `salt:hash` base64.
- **Error handling**: Routes catch errors and return JSON `{ error: string }` with appropriate status codes.

### Frontend

- **Routing**: Declared in `src/client/App.tsx` using `react-router-dom` (`BrowserRouter`).
- **Auth state**: Managed via React Context (`AuthContext`) in `App.tsx`. `useAuth()` exposes `user`, `loading`, `refresh()`, and `logout()`.
- **API calls**: All backend communication goes through `src/client/lib/api.ts`. It wraps `fetch` with `credentials: 'include'`, JSON headers, and error throwing.
- **Styling**: Tailwind CSS v4. Custom theme colors (`brand-red`, `brand-red-dark`) and `font-sans` are defined in `src/client/index.css` using the `@theme` directive.
- **Pages**: Each route has a dedicated component in `src/client/pages/`. No nested layout components — each page handles its own header/nav.

### Database

- **Schema**: Defined in `src/db/schema.ts` using `drizzle-orm/sqlite-core`. Table names use snake_case in SQL and camelCase in TypeScript.
- **Indexes**: Explicit indexes are declared in the table definitions (e.g., `users_email_idx`).
- **Defaults**: Timestamps default to `sql\`(unixepoch())\``.
- **Types**: Inferred types are exported at the bottom of `schema.ts` (e.g., `export type User = typeof users.$inferSelect`).
- **Migrations**: Drizzle Kit generates SQL files into `migrations/`. D1 migrations are applied via `wrangler d1 migrations apply`.

---

## Auth Flow

1. **Register** → `POST /api/auth/register` → password hashed with PBKDF2 → user inserted → session token generated → `session` cookie set (httpOnly, secure, SameSite=Lax).
2. **Login** → `POST /api/auth/login` → password verified → new session token → cookie set.
3. **Me** → `GET /api/auth/me` reads `session` cookie, validates against D1 `sessions` table, returns `{ user }`.
4. **Logout** → `POST /api/auth/logout` deletes session from DB and clears cookie.
5. **Middleware**: `requireAuth` validates the session on every protected request. `requireRole('teacher' | 'school' | 'admin')` checks the user's role.

Session tokens expire after 7 days; expired tokens are pruned on validation.

---

## Security Considerations

- **Password hashing**: PBKDF2-SHA256 with 100,000 iterations and random 16-byte salts. Uses Web Crypto API (available in Workers).
- **Cookies**: httpOnly, secure, SameSite=Lax. Max age = 7 days.
- **No CSRF tokens**: SameSite=Lax cookies are the primary defense. If you add mutating non-JSON endpoints, consider CSRF tokens.
- **Stripe webhooks**: The webhook endpoint (`/api/payments/webhook`) currently parses the payload without signature verification. For production, verify with `STRIPE_WEBHOOK_SECRET` using `stripe.webhooks.constructEvent`.
- **File uploads**: Type-restricted (CV → PDF/DOC, headshot → image, video → MP4/MOV/WebM). Files are streamed directly into R2 with `crypto.randomUUID()` keys under `{userId}/{type}/{uuid}.{ext}`.
- **SQL injection**: Mitigated by Drizzle ORM parameterized queries.
- **XSS**: React's default escaping handles most cases. No `dangerouslySetInnerHTML` is used.

---

## Testing Strategy

**There is currently no testing framework installed.** The project has no unit tests, integration tests, or E2E tests.

If you add tests, the natural choices would be:
- **Backend**: Vitest (same ecosystem as Vite) + `miniflare` or `wrangler` for Worker bindings.
- **Frontend**: Vitest + React Testing Library.
- **E2E**: Playwright (tests the full Vite + Worker stack).

---

## Environment Variables

### Local Development (`.env`)

Create a `.env` file from `.env.example` for Drizzle Kit studio / migration commands:

```bash
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_DATABASE_ID=...
CLOUDFLARE_D1_TOKEN=...
```

These are **not** used by the Worker runtime — they are only for the `drizzle-kit` CLI.

### Runtime Secrets

Set via `wrangler secret put <NAME>`:

- `STRIPE_SECRET_KEY`
- `SESSION_SECRET`

---

## Important Notes for Agents

1. **Do not change `package.json` `type` field** — the project is ESM (`"type": "module"`). All imports use `.ts` extensions or bare specifiers.
2. **Do not add Node.js built-ins** — the backend runs on the Cloudflare Workers runtime, not Node. Use Web Crypto, `fetch`, and standard Web APIs.
3. **D1 is SQLite** — use `drizzle-orm/sqlite-core` schema builders. Migration SQL must be valid SQLite.
4. **Vite root is `src/client`** — the build outputs to `dist/` at the repo root. The HTML entry is `src/client/index.html`.
5. **No CSS framework besides Tailwind** — do not add MUI, Chakra, etc., unless explicitly requested.
6. **AuthContext lives in `App.tsx`** — if you need auth state in a page, import `useAuth` from `../App`.
7. **API base is `/api`** — both client `lib/api.ts` and server routes assume this prefix. Vite's dev proxy handles forwarding.
8. **When adding a new route file**, create it in `src/server/routes/`, then mount it in `src/server/index.ts` with `app.route('/api/<name>', ...)`. Use the same `Env` bindings type.
9. **When adding a new page**, create it in `src/client/pages/`, then add a `<Route>` in `src/client/App.tsx`.
10. **Migrations vs. seed data**: Schema changes → `drizzle-kit generate` → `wrangler d1 migrations apply`. Research data seeding → `scripts/generate-seed-sql.ts` → `wrangler d1 execute --file=seed.sql`.
