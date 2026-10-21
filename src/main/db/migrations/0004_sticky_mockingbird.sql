CREATE TABLE `setup_custom_columns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`setup_id` integer NOT NULL,
	`custom_column_id` integer NOT NULL,
	`is_required` integer DEFAULT false NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`setup_id`) REFERENCES `setups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`custom_column_id`) REFERENCES `custom_columns`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_custom_columns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`setup_id` integer,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`options` text,
	`report_filter` integer DEFAULT false NOT NULL,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`setup_id`) REFERENCES `setups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_custom_columns`("id", "setup_id", "name", "type", "options", "report_filter", "description", "created_at", "updated_at") SELECT "id", "setup_id", "name", "type", "options", "report_filter", NULL, "created_at", "updated_at" FROM `custom_columns`;--> statement-breakpoint
DROP TABLE `custom_columns`;--> statement-breakpoint
ALTER TABLE `__new_custom_columns` RENAME TO `custom_columns`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
INSERT OR IGNORE INTO `setup_custom_columns` (`setup_id`, `custom_column_id`, `is_required`, `order_index`, `created_at`, `updated_at`)
SELECT `setup_id`, `id`, 0, 0, `created_at`, `updated_at`
FROM `custom_columns`
WHERE `setup_id` IS NOT NULL;