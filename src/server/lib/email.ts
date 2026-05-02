/**
 * Email helper for the Hono backend.
 * Wraps the Cloudflare SEND_EMAIL binding with typed defaults.
 */

export interface EmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  replyTo?: string
  cc?: string | string[]
  bcc?: string | string[]
}

const DEFAULT_FROM = 'team@educonnectchina.com'

export async function sendEmail(
  sendEmailBinding: SendEmail,
  options: EmailOptions
): Promise<void> {
  try {
    await sendEmailBinding.send({
      from: DEFAULT_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
    })
  } catch (err) {
    console.error('[email] Failed to send email:', err)
    throw err
  }
}
