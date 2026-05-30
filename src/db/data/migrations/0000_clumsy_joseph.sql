CREATE TABLE `crawled_links` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`title` text,
	`summary` text,
	`crawled_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `developer` (
	`id` text PRIMARY KEY DEFAULT 'developer' NOT NULL,
	`name` text,
	`headline` text,
	`bio` text,
	`website` text,
	`summary` text,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `social_links` (
	`id` text PRIMARY KEY NOT NULL,
	`platform` text NOT NULL,
	`url` text NOT NULL
);
