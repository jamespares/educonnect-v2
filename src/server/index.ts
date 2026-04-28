import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import authRoutes from './routes/auth'
import teacherRoutes from './routes/teachers'
import schoolRoutes from './routes/schools'
import jobRoutes from './routes/jobs'
import applicationRoutes from './routes/applications'
import uploadRoutes from './routes/upload'
import paymentRoutes from './routes/payments'
import type { Env } from './auth'

const app = new Hono<{ Bindings: Env }>()

// Middleware
app.use(logger())
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8787'],
  credentials: true,
}))

// Health check
app.get('/api/health', (c) => c.json({ ok: true, env: c.env.DB ? 'db-ready' : 'no-db' }))

// API Routes
app.route('/api/auth', authRoutes)
app.route('/api/teachers', teacherRoutes)
app.route('/api/schools', schoolRoutes)
app.route('/api/jobs', jobRoutes)
app.route('/api/applications', applicationRoutes)
app.route('/api/upload', uploadRoutes)
app.route('/api/payments', paymentRoutes)

// SPA fallback: serve index.html for all non-API routes
// In production with Workers Assets, static files are served automatically.
// This catches client-side routes like /dashboard, /jobs/123, etc.
app.get('*', async (c) => {
  const url = new URL(c.req.url)
  if (url.pathname.startsWith('/api')) {
    return c.json({ error: 'Not found' }, 404)
  }

  // Try to serve from ASSETS binding (Cloudflare Workers Assets)
  try {
    const asset = await c.env.ASSETS.fetch(new Request(`${url.origin}/index.html`, c.req.raw))
    if (asset.status === 200) return asset
  } catch {
    // ASSETS not available in local dev
  }

  // Fallback: return a simple HTML shell
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EduConnect</title>
  <script type="module" src="/src/main.tsx"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>`)
})

export default app
