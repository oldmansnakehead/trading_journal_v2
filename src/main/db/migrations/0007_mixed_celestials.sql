ALTER TABLE `research_entry_zones` ADD `sl_points` real;--> statement-breakpoint
ALTER TABLE `research_entry_zones` ADD `real_sl_points` real;--> statement-breakpoint
UPDATE `research_entry_zones` SET `sl_points` = `min_sl_points` WHERE `sl_points` IS NULL AND `min_sl_points` IS NOT NULL;
