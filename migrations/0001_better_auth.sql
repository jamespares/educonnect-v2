-- Better Auth tables
CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text,
  "email" text NOT NULL UNIQUE,
  "email_verified" integer,
  "image" text,
  "created_at" integer DEFAULT (unixepoch()),
  "updated_at" integer DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY NOT NULL,
  "expires_at" integer NOT NULL,
  "token" text NOT NULL UNIQUE,
  "created_at" integer DEFAULT (unixepoch()),
  "updated_at" integer DEFAULT (unixepoch()),
  "ip_address" text,
  "user_agent" text,
  "user_id" text NOT NULL REFERENCES "user"("id")
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY NOT NULL,
  "account_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id"),
  "access_token" text,
  "refresh_token" text,
  "access_token_expires_at" integer,
  "refresh_token_expires_at" integer,
  "scope" text,
  "id_token" text,
  "password" text,
  "created_at" integer DEFAULT (unixepoch()),
  "updated_at" integer DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expires_at" integer NOT NULL,
  "created_at" integer DEFAULT (unixepoch()),
  "updated_at" integer DEFAULT (unixepoch())
);
