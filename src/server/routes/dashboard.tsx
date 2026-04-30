/** @jsxImportSource hono/jsx */
import { Hono } from 'hono'
import { Layout, Navbar } from '../components/Layout'
import { requireAuth, requireRole } from '../lib/auth'
import { createDb } from '../../db'
import { teacherProfiles, schoolProfiles, jobs, applications } from '../../db/schema'
import { eq } from 'drizzle-orm'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Teacher Dashboard
app.get('/teacher-dashboard', requireRole('teacher'), async (c) => {
  const user = c.get('user')!
  const db = createDb(c.env.DB)
  const profile = await db.select().from(teacherProfiles).where(eq(teacherProfiles.userId, user.id)).get()
  const myApplications = profile
    ? await db.select().from(applications).where(eq(applications.teacherId, profile.id)).all()
    : []

  return c.html(
    <Layout title="Teacher Dashboard" user={user}>
      <Navbar user={user} />
      <div style="padding:3rem 0">
        <div class="max-w-7xl mx-auto px-6">
          <h1 style="font-size:1.875rem;font-weight:700;margin-bottom:2rem;font-family:var(--font-heading)">
            Welcome, {profile?.firstName || 'Teacher'}!
          </h1>

          <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;margin-bottom:2rem">
            <div class="card p-8">
              <h2 style="font-size:1.25rem;font-weight:600;margin-bottom:1rem;font-family:var(--font-heading)">Profile Status</h2>
              <p style="color:var(--base-text-secondary)">
                {profile ? `Status: ${profile.status}${profile.hasPaid ? ' (Premium)' : ''}` : 'No profile yet'}
              </p>
              <a href="/profile" class="btn btn-primary" style="margin-top:1rem">{profile ? 'Edit Profile' : 'Create Profile'}</a>
            </div>
            <div class="card p-8">
              <h2 style="font-size:1.25rem;font-weight:600;margin-bottom:1rem;font-family:var(--font-heading)">Applications</h2>
              <p style="color:var(--base-text-secondary)">{myApplications.length} application(s) submitted</p>
              <a href="/jobs" class="btn btn-primary" style="margin-top:1rem">Browse Jobs</a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
})

// School Dashboard
app.get('/school-dashboard', requireRole('school'), async (c) => {
  const user = c.get('user')!
  const db = createDb(c.env.DB)
  const profile = await db.select().from(schoolProfiles).where(eq(schoolProfiles.userId, user.id)).get()
  const myJobs = profile
    ? await db.select().from(jobs).where(eq(jobs.schoolId, profile.id)).all()
    : []

  return c.html(
    <Layout title="School Dashboard" user={user}>
      <Navbar user={user} />
      <div style="padding:3rem 0">
        <div class="max-w-7xl mx-auto px-6">
          <h1 style="font-size:1.875rem;font-weight:700;margin-bottom:2rem;font-family:var(--font-heading)">
            {profile?.name || 'School'} Dashboard
          </h1>

          <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;margin-bottom:2rem">
            <div class="card p-8">
              <h2 style="font-size:1.25rem;font-weight:600;margin-bottom:1rem;font-family:var(--font-heading)">Job Postings</h2>
              <p style="color:var(--base-text-secondary)">{myJobs.length} active job(s)</p>
              <a href="/profile" class="btn btn-primary" style="margin-top:1rem">Manage Jobs</a>
            </div>
            <div class="card p-8">
              <h2 style="font-size:1.25rem;font-weight:600;margin-bottom:1rem;font-family:var(--font-heading)">Profile</h2>
              <p style="color:var(--base-text-secondary)">{profile ? 'Complete' : 'Incomplete'}</p>
              <a href="/profile" class="btn btn-primary" style="margin-top:1rem">{profile ? 'Edit Profile' : 'Create Profile'}</a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
})

export default app
