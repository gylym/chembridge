CREATE TABLE `achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`xp_reward` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `achievements_code_unique` ON `achievements` (`code`);--> statement-breakpoint
CREATE TABLE `chemical_elements` (
	`id` text PRIMARY KEY NOT NULL,
	`atomic_number` integer NOT NULL,
	`symbol` text NOT NULL,
	`name_kk` text NOT NULL,
	`details` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `chemical_elements_atomic_number_unique` ON `chemical_elements` (`atomic_number`);--> statement-breakpoint
CREATE UNIQUE INDEX `chemical_elements_symbol_unique` ON `chemical_elements` (`symbol`);--> statement-breakpoint
CREATE TABLE `chemical_reactions` (
	`id` text PRIMARY KEY NOT NULL,
	`equation` text NOT NULL,
	`balanced_equation` text NOT NULL,
	`type` text NOT NULL,
	`hint` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`author_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `courses_slug_unique` ON `courses` (`slug`);--> statement-breakpoint
CREATE TABLE `daily_challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`challenge_date` text NOT NULL,
	`title` text NOT NULL,
	`payload` text NOT NULL,
	`xp_reward` integer DEFAULT 35 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_challenges_challenge_date_unique` ON `daily_challenges` (`challenge_date`);--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`course_id` text NOT NULL,
	`enrolled_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enrollments_user_course_uidx` ON `enrollments` (`user_id`,`course_id`);--> statement-breakpoint
CREATE TABLE `experiment_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`experiment_id` text NOT NULL,
	`instruction` text NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`experiment_id`) REFERENCES `laboratory_experiments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `laboratory_experiments` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`safety` text NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE TABLE `lesson_content_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text NOT NULL,
	`type` text NOT NULL,
	`content` text NOT NULL,
	`position` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`lesson_id` text NOT NULL,
	`percent` integer DEFAULT 0 NOT NULL,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lesson_progress_user_lesson_uidx` ON `lesson_progress` (`user_id`,`lesson_id`);--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`module_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`objective` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`position` integer NOT NULL,
	`xp_reward` integer DEFAULT 50 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lessons_slug_unique` ON `lessons` (`slug`);--> statement-breakpoint
CREATE INDEX `lessons_module_position_idx` ON `lessons` (`module_id`,`position`);--> statement-breakpoint
CREATE TABLE `modules` (
	`id` text PRIMARY KEY NOT NULL,
	`course_id` text NOT NULL,
	`title` text NOT NULL,
	`position` integer NOT NULL,
	`prerequisite_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `modules_course_position_idx` ON `modules` (`course_id`,`position`);--> statement-breakpoint
CREATE TABLE `question_options` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`label` text NOT NULL,
	`is_correct` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`quiz_id` text NOT NULL,
	`type` text NOT NULL,
	`prompt` text NOT NULL,
	`correct_answer` text NOT NULL,
	`explanation` text NOT NULL,
	`position` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quiz_answers` (
	`id` text PRIMARY KEY NOT NULL,
	`attempt_id` text NOT NULL,
	`question_id` text NOT NULL,
	`answer` text NOT NULL,
	`is_correct` integer NOT NULL,
	FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`quiz_id` text NOT NULL,
	`user_id` text NOT NULL,
	`score` integer NOT NULL,
	`completed_at` integer NOT NULL,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `quiz_attempts_user_idx` ON `quiz_attempts` (`user_id`);--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text,
	`title` text NOT NULL,
	`pass_score` integer DEFAULT 70 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`lesson_id`) REFERENCES `lessons`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`achievement_id` text NOT NULL,
	`awarded_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`achievement_id`) REFERENCES `achievements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_achievement_once_uidx` ON `user_achievements` (`user_id`,`achievement_id`);--> statement-breakpoint
CREATE TABLE `user_experiment_results` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`experiment_id` text NOT NULL,
	`completed_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`experiment_id`) REFERENCES `laboratory_experiments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `experiment_result_user_exp_uidx` ON `user_experiment_results` (`user_id`,`experiment_id`);--> statement-breakpoint
CREATE TABLE `user_xp_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`amount` integer NOT NULL,
	`reason` text NOT NULL,
	`reference_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `xp_transaction_reference_uidx` ON `user_xp_transactions` (`user_id`,`reason`,`reference_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'student' NOT NULL,
	`level` text DEFAULT '10-сынып' NOT NULL,
	`xp` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);