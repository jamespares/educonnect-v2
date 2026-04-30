import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createDb } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { Context, MiddlewareHandler } from 'hono'
import { getCookie, deleteCookie } from 'hono/cookie'

export type AppUser = {
  id: number
  email: string
  role: 'teacher' | 'school' | 'admin'
}

export function createAuth(env: { DB: D1Database; BETTER_AUTH_SECRET: string; BETTER_AUTH_URL: string }) {
  return betterAuth({
    database: drizzleAdapter(createDb(env.DB), { provider: 'sqlite' }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
  })
}

export async function getCurrentUser(c: Context): Promise<AppUser | null> {
  const db = createDb(c.env.DB)

  // Try Better Auth session first
  try {
    const auth = createAuth(c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (session?.user) {
      const legacyUser = await db.select().from(users).where(eq(users.email, session.user.email)).get()
      if (legacyUser) {
        return { id: legacyUser.id, email: legacyUser.email, role: legacyUser.role as 'teacher' | 'school' | 'admin' }
      }
      // Better Auth user exists but no legacy user — create one with default role
      const [newUser] = await db.insert(users).values({
        email: session.user.email,
        passwordHash: '',
        role: 'teacher',
      }).returning()
      return { id: newUser.id, email: newUser.email, role: newUser.role as 'teacher' | 'school' | 'admin' }
    }
  } catch {
    // Fall through to legacy
  }

  // Legacy session fallback
  const token = getCookie(c, 'session')
  if (!token) return null

  const { validateSession } = await import('../auth')
  const user = await validateSession(db, token)
  if (!user) return null

  return { id: user.id, email: user.email, role: user.role as 'teacher' | 'school' | 'admin' }
}

export async function logout(c: Context) {
  deleteCookie(c, 'better-auth.session_token')
  deleteCookie(c, 'session')
}

export const requireAuth: MiddlewareHandler<{ Bindings: CloudflareBindings; Variables: { user: AppUser } }> = async (c, next) => {
  const user = await getCurrentUser(c)
  if (!user) {
    return c.redirect('/login')
  }
  c.set('user', user)
  await next()
}

export const requireRole = (...roles: string[]): MiddlewareHandler<{ Bindings: CloudflareBindings; Variables: { user: AppUser } }> => async (c, next) => {
  const user = await getCurrentUser(c)
  if (!user || !roles.includes(user.role)) {
    return c.redirect(user ? `/${user.role}-dashboard` : '/login')
  }
  c.set('user', user)
  await next()
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AppUser | null
  }
}
