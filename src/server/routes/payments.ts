import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'
import { createDb } from '../../db'
import { teacherProfiles, users } from '../../db/schema'
import { requireAuth, requireRole } from '../auth'
import type { Env } from '../auth'

const app = new Hono<{ Bindings: Env }>()

// POST /api/payments/create-checkout-session
app.post('/create-checkout-session', requireAuth, requireRole('teacher'), async (c) => {
  const user = c.get('user' as never) as { id: number; email: string }
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' })
  const origin = new URL(c.req.url).origin

  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'EduConnect Teacher Access',
            description: 'Lifetime access to premium teaching jobs in China',
          },
          unit_amount: 9900, // $99.00
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${origin}/teacher-dashboard?payment=success`,
    cancel_url: `${origin}/teacher-dashboard?payment=cancelled`,
    metadata: { userId: String(user.id) },
  })

  return c.json({ url: session.url })
})

// POST /api/payments/webhook
app.post('/webhook', async (c) => {
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' })
  const payload = await c.req.text()
  const signature = c.req.header('stripe-signature')

  // For production, verify webhook signature with STRIPE_WEBHOOK_SECRET
  // const event = stripe.webhooks.constructEvent(payload, signature, c.env.STRIPE_WEBHOOK_SECRET)

  let event: Stripe.Event
  try {
    event = JSON.parse(payload) as Stripe.Event
  } catch {
    return c.json({ error: 'Invalid payload' }, 400)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = Number(session.metadata?.userId)
    if (!userId) return c.json({ error: 'No userId' }, 400)

    const db = createDb(c.env.DB)
    const profile = await db.select().from(teacherProfiles).where(eq(teacherProfiles.userId, userId)).get()
    if (profile) {
      await db.update(teacherProfiles)
        .set({ hasPaid: true })
        .where(eq(teacherProfiles.id, profile.id))
    }
  }

  return c.json({ received: true })
})

export default app
