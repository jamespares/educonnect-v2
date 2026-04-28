-- EduConnect v2 Initial Schema
-- D1 SQLite

CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);

CREATE TABLE `teacher_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`phone` text,
	`nationality` text,
	`years_experience` text,
	`education` text,
	`subject_specialty` text,
	`preferred_location` text,
	`preferred_age_group` text,
	`cv_url` text,
	`headshot_url` text,
	`video_url` text,
	`linkedin` text,
	`bio` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`has_paid` integer DEFAULT false NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `school_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`name_chinese` text,
	`location` text,
	`city` text,
	`province` text,
	`school_type` text,
	`description` text,
	`website` text,
	`contact_name` text,
	`contact_email` text,
	`contact_phone` text,
	`is_active` integer DEFAULT true NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`school_id` integer,
	`title` text NOT NULL,
	`company` text,
	`location` text,
	`city` text,
	`salary` text,
	`experience_required` text,
	`chinese_required` integer DEFAULT false NOT NULL,
	`description` text,
	`requirements` text,
	`benefits` text,
	`subjects` text,
	`age_groups` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `school_profiles`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teacher_id` integer NOT NULL,
	`job_id` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`teacher_id`) REFERENCES `teacher_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
CREATE UNIQUE INDEX `teacher_profiles_user_id_unique` ON `teacher_profiles` (`user_id`);
CREATE UNIQUE INDEX `school_profiles_user_id_unique` ON `school_profiles` (`user_id`);
CREATE INDEX `users_email_idx` ON `users` (`email`);
CREATE INDEX `jobs_school_id_idx` ON `jobs` (`school_id`);
CREATE INDEX `jobs_city_idx` ON `jobs` (`city`);
CREATE INDEX `jobs_active_idx` ON `jobs` (`is_active`);
CREATE INDEX `applications_teacher_idx` ON `applications` (`teacher_id`);
CREATE INDEX `applications_job_idx` ON `applications` (`job_id`);
