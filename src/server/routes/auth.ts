import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
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
import type { Env } from '../auth'

const app = new Hono<{ Bindings: Env }>()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['teacher', 'school']),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// POST /api/auth/register
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

// POST /api/auth/login
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

export default app
