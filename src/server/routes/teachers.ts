import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { createDb } from '../../db'
import { teacherProfiles } from '../../db/schema'
import { requireAuth, requireRole } from '../auth'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use('*', requireAuth, requireRole('teacher', 'admin'))

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  yearsExperience: z.string().optional(),
  education: z.string().optional(),
  subjectSpecialty: z.string().optional(),
  preferredLocation: z.string().optional(),
  preferredAgeGroup: z.string().optional(),
  linkedin: z.string().optional(),
  bio: z.string().optional(),
})

// GET /api/teachers/profile
app.get('/profile', async (c) => {
  const user = c.get('user' as never) as { id: number }
  const db = createDb(c.env.DB)
  const profile = await db.select().from(teacherProfiles).where(eq(teacherProfiles.userId, user.id)).get()
  return c.json({ profile: profile || null })
})

// POST /api/teachers/profile
app.post('/profile', zValidator('json', profileSchema), async (c) => {
  const user = c.get('user' as never) as { id: number }
  const body = c.req.valid('json')
  const db = createDb(c.env.DB)

  const existing = await db.select().from(teacherProfiles).where(eq(teacherProfiles.userId, user.id)).get()

  if (existing) {
    await db.update(teacherProfiles).set({ ...body, updatedAt: new Date() }).where(eq(teacherProfiles.id, existing.id))
    const updated = await db.select().from(teacherProfiles).where(eq(teacherProfiles.id, existing.id)).get()
    return c.json({ profile: updated })
  }

  const inserted = await db.insert(teacherProfiles).values({ userId: user.id, ...body }).returning()
  return c.json({ profile: inserted[0] })
})

export default app
