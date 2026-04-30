import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { createDb } from '../../db'
import { teacherProfiles } from '../../db/schema'
import { requireAuth } from '../auth'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// POST /api/upload — upload file to R2
app.post('/', requireAuth, async (c) => {
  const user = c.get('user' as never) as { id: number; role: string }
  const body = await c.req.parseBody({ all: false })
  const file = body.file as File | undefined
  const type = body.type as string | undefined // 'cv', 'headshot', 'video'

  if (!file || !type) {
    return c.json({ error: 'Missing file or type' }, 400)
  }

  // Validate file type
  const allowedTypes: Record<string, string[]> = {
    cv: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    headshot: ['image/jpeg', 'image/png', 'image/webp'],
    video: ['video/mp4', 'video/quicktime', 'video/webm'],
  }

  if (!allowedTypes[type]?.includes(file.type)) {
    return c.json({ error: `Invalid file type for ${type}` }, 400)
  }

  // Generate key: {userId}/{type}/{random}-{filename}
  const ext = file.name.split('.').pop() || 'bin'
  const key = `${user.id}/${type}/${crypto.randomUUID()}.${ext}`

  // Upload to R2
  await c.env.BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  })

  // Build public URL (via Worker proxy)
  const url = `/api/files/${key}`

  // Update teacher profile with file URL
  if (user.role === 'teacher') {
    const db = createDb(c.env.DB)
    const profile = await db.select().from(teacherProfiles).where(eq(teacherProfiles.userId, user.id)).get()
    if (profile) {
      const updates: Record<string, string> = {}
      if (type === 'cv') updates.cvUrl = url
      if (type === 'headshot') updates.headshotUrl = url
      if (type === 'video') updates.videoUrl = url
      await db.update(teacherProfiles).set(updates).where(eq(teacherProfiles.id, profile.id))
    }
  }

  return c.json({ url, key })
})

// GET /api/files/:key — serve file from R2
app.get('/:key{.+}', async (c) => {
  const key = c.req.param('key')
  const obj = await c.env.BUCKET.get(key)
  if (!obj) return c.json({ error: 'Not found' }, 404)

  const headers = new Headers()
  headers.set('Content-Type', obj.httpMetadata?.contentType || 'application/octet-stream')
  headers.set('Cache-Control', 'public, max-age=31536000')
  return new Response(obj.body, { headers })
})

export default app
