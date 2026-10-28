CREATE TABLE `research_custom_columns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`options` text,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `research_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`setup_id` integer NOT NULL,
	`symbol_id` integer NOT NULL,
	`entry_datetime` text NOT NULL,
	`exit_datetime` text,
	`session_name` text,
	`timeframe` text,
	`news` integer DEFAULT false,
	`quality` text,
	`images` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`setup_id`) REFERENCES `research_setups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`symbol_id`) REFERENCES `symbols`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `research_entry_zones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`research_entry_id` integer NOT NULL,
	`custom_column_id` integer NOT NULL,
	`bias` text,
	`min_rr` real,
	`max_rr` real,
	`min_sl_points` real,
	`max_sl_points` real,
	`is_missed` integer DEFAULT false,
	`outcome` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`research_entry_id`) REFERENCES `research_entries`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`custom_column_id`) REFERENCES `research_custom_columns`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `research_setup_custom_columns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`setup_id` integer NOT NULL,
	`custom_column_id` integer NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`setup_id`) REFERENCES `research_setups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`custom_column_id`) REFERENCES `research_custom_columns`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `research_setup_playbook_flows` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`setup_id` integer NOT NULL,
	`flow_data` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`setup_id`) REFERENCES `research_setups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `research_setup_playbook_flows_setup_id_unique` ON `research_setup_playbook_flows` (`setup_id`);--> statement-breakpoint
CREATE TABLE `research_setup_playbooks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`setup_id` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`setup_id`) REFERENCES `research_setups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `research_setup_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`setup_id` integer NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`session_name` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`setup_id`) REFERENCES `research_setups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `research_setups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`type` text NOT NULL,
	`enable_exit_date` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
