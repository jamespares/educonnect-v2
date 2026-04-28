/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database
  BUCKET: R2Bucket
  STRIPE_SECRET_KEY: string
  SESSION_SECRET: string
  ASSETS: Fetcher
}
