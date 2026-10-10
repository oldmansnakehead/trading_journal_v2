CREATE TABLE `custom_columns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`setup_id` integer NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`report_filter` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`setup_id`) REFERENCES `setups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`setup_id` integer NOT NULL,
	`entry_datetime` text NOT NULL,
	`exit_datetime` text,
	`symbol_id` integer NOT NULL,
	`session_name` text,
	`position` text,
	`direction_bias` text,
	`entry_timeframe` text,
	`strategies` text,
	`news` integer DEFAULT false,
	`quality` text,
	`is_test` integer DEFAULT false,
	`images` text,
	`notes` text,
	`normal_rr` real,
	`normal_max_rr` real,
	`normal_sl_points` real,
	`normal_tp_points` real,
	`be_rr` real,
	`be_max_rr` real,
	`be_sl_points` real,
	`be_tp_points` real,
	`trail_rr` real,
	`trail_max_rr` real,
	`trail_sl_points` real,
	`trail_tp_points` real,
	`custom_data` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`setup_id`) REFERENCES `setups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`symbol_id`) REFERENCES `symbols`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `setup_playbooks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`setup_id` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`setup_id`) REFERENCES `setups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `setup_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`setup_id` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`session_name` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`setup_id`) REFERENCES `setups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `setups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `strategies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`setup_id` integer NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`setup_id`) REFERENCES `setups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `symbols` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `symbols_name_unique` ON `symbols` (`name`);