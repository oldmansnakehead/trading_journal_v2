ALTER TABLE `research_entry_zones` ADD `is_no_zone` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `research_entry_zones` ADD `invalidation_reason` text;--> statement-breakpoint
ALTER TABLE `research_entry_zones` ADD `holding_duration_minutes` integer;--> statement-breakpoint
ALTER TABLE `research_entry_zones` ADD `holding_bars` integer;--> statement-breakpoint
ALTER TABLE `research_entry_zones` ADD `entry_datetime` text;--> statement-breakpoint
ALTER TABLE `research_entry_zones` ADD `exit_datetime` text;--> statement-breakpoint
ALTER TABLE `research_entry_zones` ADD `zone_instance_name` text;