import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { createDb } from '../../db'
import { schoolProfiles } from '../../db/schema'
import { requireAuth, requireRole } from '../auth'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use('*', requireAuth, requireRole('school', 'admin'))

const profileSchema = z.object({
  name: z.string().min(1),
  nameChinese: z.string().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  schoolType: z.enum(['international', 'bilingual', 'public', 'private']).optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
})

// GET /api/schools/profile
app.get('/profile', async (c) => {
  const user = c.get('user' as never) as { id: number }
  const db = createDb(c.env.DB)
  const profile = await db.select().from(schoolProfiles).where(eq(schoolProfiles.userId, user.id)).get()
  return c.json({ profile: profile || null })
})

// POST /api/schools/profile
app.post('/profile', zValidator('json', profileSchema), async (c) => {
  const user = c.get('user' as never) as { id: number }
  const body = c.req.valid('json')
  const db = createDb(c.env.DB)

  const existing = await db.select().from(schoolProfiles).where(eq(schoolProfiles.userId, user.id)).get()

  if (existing) {
    await db.update(schoolProfiles).set({ ...body, updatedAt: new Date() }).where(eq(schoolProfiles.id, existing.id))
    const updated = await db.select().from(schoolProfiles).where(eq(schoolProfiles.id, existing.id)).get()
    return c.json({ profile: updated })
  }

  const inserted = await db.insert(schoolProfiles).values({ userId: user.id, ...body }).returning()
  return c.json({ profile: inserted[0] })
})

export default app
