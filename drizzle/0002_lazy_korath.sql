CREATE TABLE `rate_limit_buckets` (
	`key` text NOT NULL,
	`bucket` integer NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rate_limit_key_bucket_uidx` ON `rate_limit_buckets` (`key`,`bucket`);