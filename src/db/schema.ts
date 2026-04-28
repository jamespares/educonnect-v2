import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'

// ─── Users (unified auth) ─────────────────────────────────────────
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['teacher', 'school', 'admin'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (t) => [
  index('users_email_idx').on(t.email),
])

// ─── Teacher Profiles ─────────────────────────────────────────────
export const teacherProfiles = sqliteTable('teacher_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone'),
  nationality: text('nationality'),
  yearsExperience: text('years_experience'),
  education: text('education'),
  subjectSpecialty: text('subject_specialty'),
  preferredLocation: text('preferred_location'),
  preferredAgeGroup: text('preferred_age_group'),
  cvUrl: text('cv_url'),
  headshotUrl: text('headshot_url'),
  videoUrl: text('video_url'),
  linkedin: text('linkedin'),
  bio: text('bio'),
  status: text('status', { enum: ['pending', 'active', 'placed'] }).notNull().default('pending'),
  hasPaid: integer('has_paid', { mode: 'boolean' }).notNull().default(false),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// ─── School Profiles ──────────────────────────────────────────────
export const schoolProfiles = sqliteTable('school_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  nameChinese: text('name_chinese'),
  location: text('location'),
  city: text('city'),
  province: text('province'),
  schoolType: text('school_type', { enum: ['international', 'bilingual', 'public', 'private'] }),
  description: text('description'),
  website: text('website'),
  contactName: text('contact_name'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// ─── Jobs ─────────────────────────────────────────────────────────
export const jobs = sqliteTable('jobs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  schoolId: integer('school_id').notNull().references(() => schoolProfiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  company: text('company'),
  location: text('location'),
  city: text('city'),
  salary: text('salary'),
  experienceRequired: text('experience_required'),
  chineseRequired: integer('chinese_required', { mode: 'boolean' }).notNull().default(false),
  description: text('description'),
  requirements: text('requirements'),
  benefits: text('benefits'),
  subjects: text('subjects'), // comma-separated for MVP simplicity
  ageGroups: text('age_groups'), // comma-separated for MVP simplicity
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (t) => [
  index('jobs_school_id_idx').on(t.schoolId),
  index('jobs_city_idx').on(t.city),
  index('jobs_active_idx').on(t.isActive),
])

// ─── Applications ─────────────────────────────────────────────────
export const applications = sqliteTable('applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  teacherId: integer('teacher_id').notNull().references(() => teacherProfiles.id, { onDelete: 'cascade' }),
  jobId: integer('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['pending', 'reviewing', 'interview_scheduled', 'offer_extended', 'placed', 'declined'] }).notNull().default('pending'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (t) => [
  index('applications_teacher_idx').on(t.teacherId),
  index('applications_job_idx').on(t.jobId),
])

// ─── Sessions (simple cookie auth) ────────────────────────────────
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
})

// ─── Types ────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type TeacherProfile = typeof teacherProfiles.$inferSelect
export type SchoolProfile = typeof schoolProfiles.$inferSelect
export type Job = typeof jobs.$inferSelect
export type Application = typeof applications.$inferSelect
