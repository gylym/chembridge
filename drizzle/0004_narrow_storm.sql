CREATE TABLE `site_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`updated_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `site_settings_key_unique` ON `site_settings` (`key`);
--> statement-breakpoint
INSERT INTO `site_settings` (`id`, `key`, `value`, `created_at`, `updated_at`)
VALUES ('setting:site-title', 'siteTitle', '"ChemBridge"', unixepoch(), unixepoch());
