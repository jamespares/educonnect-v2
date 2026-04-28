import type { Context, MiddlewareHandler } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { createDb } from '../db'
import { sessions, users } from '../db/schema'
import { eq } from 'drizzle-orm'

export interface Env {
  DB: D1Database
  BUCKET: R2Bucket
  STRIPE_SECRET_KEY: string
  SESSION_SECRET: string
  ASSETS: Fetcher
}

export type AppContext = Context<{ Bindings: Env }>

const SESSION_COOKIE = 'session'
const SESSION_DAYS = 7

// ─── Password Hashing (Web Crypto API) ────────────────────────────
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  )
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  const hash = new Uint8Array(derived)
  // Store as salt:hash (base64)
  const saltB64 = btoa(String.fromCharCode(...salt))
  const hashB64 = btoa(String.fromCharCode(...hash))
  return `${saltB64}:${hashB64}`
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltB64, hashB64] = stored.split(':')
  if (!saltB64 || !hashB64) return false
  const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0))
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']
  )
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  const hash = new Uint8Array(derived)
  const expected = Uint8Array.from(atob(hashB64), c => c.charCodeAt(0))
  if (hash.length !== expected.length) return false
  return hash.every((v, i) => v === expected[i])
}

// ─── Session Management ───────────────────────────────────────────
async function generateSessionToken(): Promise<string> {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return btoa(String.fromCharCode(...arr)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32)
}

export async function createSession(db: ReturnType<typeof createDb>, userId: number): Promise<string> {
  const token = await generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await db.insert(sessions).values({ id: token, userId, expiresAt })
  return token
}

export async function validateSession(db: ReturnType<typeof createDb>, token: string) {
  if (!token) return null
  const row = await db.select().from(sessions).where(eq(sessions.id, token)).get()
  if (!row) return null
  if (new Date(row.expiresAt) < new Date()) {
    await db.delete(sessions).where(eq(sessions.id, token))
    return null
  }
  const user = await db.select().from(users).where(eq(users.id, row.userId)).get()
  return user ?? null
}

export async function deleteSession(db: ReturnType<typeof createDb>, token: string) {
  await db.delete(sessions).where(eq(sessions.id, token))
}

// ─── Auth Middleware ──────────────────────────────────────────────
export const requireAuth: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE)
  const db = createDb(c.env.DB)
  const user = await validateSession(db, token || '')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  c.set('user' as never, user)
  await next()
}

export const requireRole = (...roles: string[]): MiddlewareHandler<{ Bindings: Env }> => async (c, next) => {
  const user = c.get('user' as never) as Awaited<ReturnType<typeof validateSession>>
  if (!user || !roles.includes(user.role)) {
    return c.json({ error: 'Forbidden' }, 403)
  }
  await next()
}

// ─── Auth Helpers for Routes ──────────────────────────────────────
export async function registerUser(
  db: ReturnType<typeof createDb>,
  email: string,
  password: string,
  role: 'teacher' | 'school'
) {
  const existing = await db.select().from(users).where(eq(users.email, email)).get()
  if (existing) throw new Error('Email already registered')
  const passwordHash = await hashPassword(password)
  const result = await db.insert(users).values({ email, passwordHash, role }).returning()
  return result[0]
}

export async function loginUser(
  db: ReturnType<typeof createDb>,
  email: string,
  password: string
) {
  const user = await db.select().from(users).where(eq(users.email, email)).get()
  if (!user) throw new Error('Invalid credentials')
  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) throw new Error('Invalid credentials')
  return user
}

export function setSessionCookie(c: AppContext, token: string) {
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: '/',
  })
}

export function clearSessionCookie(c: AppContext) {
  setCookie(c, SESSION_COOKIE, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 0,
    path: '/',
  })
}

export { hashPassword }
