DROP INDEX `location_name_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `location_name_userId_unique` ON `location` (`name`,`user_id`);