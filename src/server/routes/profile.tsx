/** @jsxImportSource hono/jsx */
import { Hono } from 'hono'
import { Layout, Navbar } from '../components/Layout'
import { requireAuth } from '../lib/auth'
import { createDb } from '../../db'
import { teacherProfiles, schoolProfiles } from '../../db/schema'
import { eq } from 'drizzle-orm'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('/profile', requireAuth, async (c) => {
  const user = c.get('user')!
  const db = createDb(c.env.DB)

  if (user.role === 'teacher') {
    const profile = await db.select().from(teacherProfiles).where(eq(teacherProfiles.userId, user.id)).get()
    return c.html(
      <Layout title="Profile" user={user}>
        <Navbar user={user} />
        <div style="padding:3rem 0">
          <div class="max-w-4xl mx-auto px-6">
            <h1 style="font-size:1.875rem;font-weight:700;margin-bottom:2rem;font-family:var(--font-heading)">Teacher Profile</h1>
            {profile ? (
              <div class="card p-8">
                <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
                <p><strong>Subjects:</strong> {profile.subjectSpecialty || '—'}</p>
                <p><strong>Experience:</strong> {profile.yearsExperience || '—'}</p>
                <p><strong>Location preference:</strong> {profile.preferredLocation || '—'}</p>
                <p><strong>Bio:</strong> {profile.bio || '—'}</p>
                <p><strong>Status:</strong> {profile.status}</p>
              </div>
            ) : (
              <div class="card p-8 text-center">
                <p style="color:var(--base-text-secondary);margin-bottom:1.5rem">Your profile is not complete yet.</p>
                <p style="color:var(--base-text-secondary)">Profile editing via API for now. Use the original app to complete your profile.</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    )
  }

  // School profile
  const profile = await db.select().from(schoolProfiles).where(eq(schoolProfiles.userId, user.id)).get()
  return c.html(
    <Layout title="Profile" user={user}>
      <Navbar user={user} />
      <div style="padding:3rem 0">
        <div class="max-w-4xl mx-auto px-6">
          <h1 style="font-size:1.875rem;font-weight:700;margin-bottom:2rem;font-family:var(--font-heading)">School Profile</h1>
          {profile ? (
            <div class="card p-8">
              <p><strong>Name:</strong> {profile.name}</p>
              <p><strong>Location:</strong> {profile.location || '—'}</p>
              <p><strong>Type:</strong> {profile.schoolType || '—'}</p>
              <p><strong>Description:</strong> {profile.description || '—'}</p>
              <p><strong>Contact:</strong> {profile.contactName || '—'} ({profile.contactEmail || '—'})</p>
            </div>
          ) : (
            <div class="card p-8 text-center">
              <p style="color:var(--base-text-secondary);margin-bottom:1.5rem">Your school profile is not complete yet.</p>
              <p style="color:var(--base-text-secondary)">Profile editing via API for now. Use the original app to complete your profile.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
})

export default app
