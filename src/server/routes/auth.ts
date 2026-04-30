import { Hono } from 'hono'
import { getCookie, deleteCookie } from 'hono/cookie'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createDb } from '../../db'
import {
  registerUser,
  loginUser,
  createSession,
  deleteSession,
  setSessionCookie,
  clearSessionCookie,
  validateSession,
} from '../auth'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { createAuth } from '../lib/auth'

const app = new Hono<{ Bindings: CloudflareBindings }>()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['teacher', 'school']),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const setRoleSchema = z.object({
  role: z.enum(['teacher', 'school']),
})

// POST /api/auth/register — Legacy register (kept for backward compatibility)
app.post('/register', zValidator('json', registerSchema), async (c) => {
  try {
    const { email, password, role } = c.req.valid('json')
    const db = createDb(c.env.DB)
    const user = await registerUser(db, email, password, role)
    const token = await createSession(db, user.id)
    setSessionCookie(c, token)
    return c.json({ user: { id: user.id, email: user.email, role: user.role } })
  } catch (e: any) {
    return c.json({ error: e.message }, 400)
  }
})

// POST /api/auth/login — Legacy login (kept for backward compatibility)
app.post('/login', zValidator('json', loginSchema), async (c) => {
  try {
    const { email, password } = c.req.valid('json')
    const db = createDb(c.env.DB)
    const user = await loginUser(db, email, password)
    const token = await createSession(db, user.id)
    setSessionCookie(c, token)
    return c.json({ user: { id: user.id, email: user.email, role: user.role } })
  } catch (e: any) {
    return c.json({ error: e.message }, 401)
  }
})

// POST /api/auth/logout
app.post('/logout', async (c) => {
  const token = getCookie(c, 'session')
  if (token) {
    const db = createDb(c.env.DB)
    await deleteSession(db, token)
  }
  clearSessionCookie(c)
  deleteCookie(c, 'better-auth.session_token')
  return c.json({ ok: true })
})

// GET /api/auth/me
app.get('/me', async (c) => {
  const token = getCookie(c, 'session')
  if (!token) return c.json({ user: null })
  const db = createDb(c.env.DB)
  const user = await validateSession(db, token)
  if (!user) return c.json({ user: null })
  return c.json({ user: { id: user.id, email: user.email, role: user.role } })
})

// POST /api/auth/set-role — Called after Better Auth registration to set role
app.post('/set-role', async (c) => {
  const body = await c.req.json()
  const role = body.role
  if (!role || !['teacher', 'school'].includes(role)) {
    return c.json({ error: 'Invalid role' }, 400)
  }

  // Get current user from Better Auth session
  const auth = createAuth(c.env)
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session?.user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const db = createDb(c.env.DB)
    const legacyUser = await db.select().from(users).where(eq(users.email, session.user.email)).get()

    if (legacyUser) {
      // Update existing user's role if they were created with default 'teacher'
      if (legacyUser.role !== role) {
        await db.update(users).set({ role }).where(eq(users.id, legacyUser.id))
      }
      return c.json({ ok: true, user: { id: legacyUser.id, email: legacyUser.email, role } })
    }

    // Create legacy user
    const [newUser] = await db.insert(users).values({
      email: session.user.email,
      passwordHash: '',
      role,
    }).returning()

    return c.json({ ok: true, user: { id: newUser.id, email: newUser.email, role } })
  } catch (e: any) {
    return c.json({ error: e.message || 'Failed to set role' }, 500)
  }
})

export default app
