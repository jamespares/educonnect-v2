/** @jsxImportSource hono/jsx */
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { createAuth, getCurrentUser } from './lib/auth'
import authRoutes from './routes/auth'
import teacherRoutes from './routes/teachers'
import schoolRoutes from './routes/schools'
import jobRoutes from './routes/jobs'
import applicationRoutes from './routes/applications'
import uploadRoutes from './routes/upload'
import paymentRoutes from './routes/payments'
import pageRoutes from './routes/pages'
import dashboardRoutes from './routes/dashboard'
import profileRoutes from './routes/profile'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Middleware
app.use(logger())
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8787'],
  credentials: true,
}))

// Auth context for all routes
app.use('*', async (c, next) => {
  const user = await getCurrentUser(c)
  c.set('user', user)
  await next()
})

// Better Auth API routes
app.on(['POST', 'GET'], '/api/auth/better-auth/*', (c) => {
  const auth = createAuth(c.env)
  return auth.handler(c.req.raw)
})

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

// Page Routes (Hono JSX SSR)
app.route('/', pageRoutes)
app.route('/', dashboardRoutes)
app.route('/', profileRoutes)

// Root redirect
app.get('/', async (c) => {
  const user = c.get('user')
  if (user) return c.redirect(`/${user.role}-dashboard`)
  return c.redirect('/teachers')
})

export default app
