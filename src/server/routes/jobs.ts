import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, desc, and, like, sql } from 'drizzle-orm'
import { createDb } from '../../db'
import { jobs, schoolProfiles } from '../../db/schema'
import { requireAuth, requireRole } from '../auth'
import type { Env } from '../auth'

const app = new Hono<{ Bindings: Env }>()

// Public: GET /api/jobs (list)
app.get('/', async (c) => {
  const db = createDb(c.env.DB)
  const city = c.req.query('city')
  const subject = c.req.query('subject')

  const conditions = [eq(jobs.isActive, true)]
  if (city) conditions.push(like(jobs.city, `%${city}%`))
  if (subject) conditions.push(like(jobs.subjects, `%${subject}%`))

  const list = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      company: jobs.company,
      location: jobs.location,
      city: jobs.city,
      salary: jobs.salary,
      subjects: jobs.subjects,
      ageGroups: jobs.ageGroups,
      experienceRequired: jobs.experienceRequired,
      createdAt: jobs.createdAt,
      schoolName: jobs.company || schoolProfiles.name,
      schoolType: schoolProfiles.schoolType,
    })
    .from(jobs)
    .leftJoin(schoolProfiles, eq(jobs.schoolId, schoolProfiles.id))
    .where(and(...conditions))
    .orderBy(desc(jobs.createdAt))
    .limit(50)
    .all()

  return c.json({ jobs: list })
})

// Public: GET /api/jobs/:id
app.get('/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const db = createDb(c.env.DB)
  const job = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      location: jobs.location,
      city: jobs.city,
      salary: jobs.salary,
      experienceRequired: jobs.experienceRequired,
      chineseRequired: jobs.chineseRequired,
      description: jobs.description,
      requirements: jobs.requirements,
      benefits: jobs.benefits,
      subjects: jobs.subjects,
      ageGroups: jobs.ageGroups,
      createdAt: jobs.createdAt,
      schoolName: jobs.company || schoolProfiles.name,
      schoolDescription: schoolProfiles.description,
      schoolWebsite: schoolProfiles.website,
    })
    .from(jobs)
    .leftJoin(schoolProfiles, eq(jobs.schoolId, schoolProfiles.id))
    .where(eq(jobs.id, id))
    .get()

  if (!job) return c.json({ error: 'Not found' }, 404)
  return c.json({ job })
})

// Protected: POST /api/jobs (schools create)
app.post('/', requireAuth, requireRole('school', 'admin'), zValidator('json', z.object({
  title: z.string().min(1),
  location: z.string().optional(),
  city: z.string().optional(),
  salary: z.string().optional(),
  experienceRequired: z.string().optional(),
  chineseRequired: z.boolean().optional(),
  description: z.string().optional(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  subjects: z.string().optional(),
  ageGroups: z.string().optional(),
})), async (c) => {
  const user = c.get('user' as never) as { id: number }
  const body = c.req.valid('json')
  const db = createDb(c.env.DB)

  const school = await db.select().from(schoolProfiles).where(eq(schoolProfiles.userId, user.id)).get()
  if (!school) return c.json({ error: 'School profile required' }, 400)

  const inserted = await db.insert(jobs).values({
    schoolId: school.id,
    ...body,
    chineseRequired: body.chineseRequired ?? false,
  }).returning()

  return c.json({ job: inserted[0] }, 201)
})

export default app
