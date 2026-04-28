import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq, and, desc, inArray } from 'drizzle-orm'
import { createDb } from '../../db'
import { applications, jobs, teacherProfiles, schoolProfiles } from '../../db/schema'
import { requireAuth, requireRole } from '../auth'
import type { Env } from '../auth'

const app = new Hono<{ Bindings: Env }>()
app.use('*', requireAuth)

// POST /api/applications (teacher applies)
app.post('/', requireRole('teacher'), zValidator('json', z.object({
  jobId: z.number(),
})), async (c) => {
  const user = c.get('user' as never) as { id: number }
  const db = createDb(c.env.DB)

  const teacher = await db.select().from(teacherProfiles).where(eq(teacherProfiles.userId, user.id)).get()
  if (!teacher) return c.json({ error: 'Complete your profile first' }, 400)

  const { jobId } = c.req.valid('json')

  const existing = await db
    .select().from(applications)
    .where(and(eq(applications.teacherId, teacher.id), eq(applications.jobId, jobId)))
    .get()

  if (existing) return c.json({ error: 'Already applied' }, 400)

  const inserted = await db.insert(applications).values({
    teacherId: teacher.id,
    jobId,
  }).returning()

  return c.json({ application: inserted[0] }, 201)
})

// GET /api/applications/my (teacher views their apps)
app.get('/my', requireRole('teacher'), async (c) => {
  const user = c.get('user' as never) as { id: number }
  const db = createDb(c.env.DB)

  const teacher = await db.select().from(teacherProfiles).where(eq(teacherProfiles.userId, user.id)).get()
  if (!teacher) return c.json({ applications: [] })

  const list = await db
    .select({
      id: applications.id,
      status: applications.status,
      notes: applications.notes,
      createdAt: applications.createdAt,
      jobTitle: jobs.title,
      jobCity: jobs.city,
      schoolName: schoolProfiles.name,
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .leftJoin(schoolProfiles, eq(jobs.schoolId, schoolProfiles.id))
    .where(eq(applications.teacherId, teacher.id))
    .orderBy(desc(applications.createdAt))
    .all()

  return c.json({ applications: list })
})

// GET /api/applications/for-school (school views apps to their jobs)
app.get('/for-school', requireRole('school'), async (c) => {
  const user = c.get('user' as never) as { id: number }
  const db = createDb(c.env.DB)

  const school = await db.select().from(schoolProfiles).where(eq(schoolProfiles.userId, user.id)).get()
  if (!school) return c.json({ applications: [] })

  // Get all jobs for this school, then all applications
  const schoolJobs = await db.select().from(jobs).where(eq(jobs.schoolId, school.id)).all()
  const jobIds = schoolJobs.map(j => j.id)
  if (jobIds.length === 0) return c.json({ applications: [] })

  const list = await db
    .select({
      id: applications.id,
      status: applications.status,
      notes: applications.notes,
      createdAt: applications.createdAt,
      jobTitle: jobs.title,
      teacherFirstName: teacherProfiles.firstName,
      teacherLastName: teacherProfiles.lastName,
      teacherSubject: teacherProfiles.subjectSpecialty,
      teacherLocation: teacherProfiles.preferredLocation,
    })
    .from(applications)
    .leftJoin(jobs, eq(applications.jobId, jobs.id))
    .leftJoin(teacherProfiles, eq(applications.teacherId, teacherProfiles.id))
    .where(inArray(applications.jobId, jobIds))
    .orderBy(desc(applications.createdAt))
    .all()

  return c.json({ applications: list })
})

// PATCH /api/applications/:id/status (school updates status)
app.patch('/:id/status', requireRole('school', 'admin'), zValidator('json', z.object({
  status: z.enum(['pending', 'reviewing', 'interview_scheduled', 'offer_extended', 'placed', 'declined']),
  notes: z.string().optional(),
})), async (c) => {
  const id = Number(c.req.param('id'))
  const { status, notes } = c.req.valid('json')
  const db = createDb(c.env.DB)

  await db.update(applications)
    .set({ status, notes: notes || undefined })
    .where(eq(applications.id, id))

  return c.json({ ok: true })
})

export default app
