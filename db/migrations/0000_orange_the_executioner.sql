CREATE TABLE `books` (
	`id` integer PRIMARY KEY NOT NULL,
	`name_pt` text NOT NULL,
	`name_en` text NOT NULL,
	`abbreviation` text NOT NULL,
	`testament` text NOT NULL,
	`total_chapters` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `highlights` (
	`id` text PRIMARY KEY NOT NULL,
	`verse_id` integer NOT NULL,
	`color` text NOT NULL,
	`created_at` text NOT NULL,
	`synced` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `lxx_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`verse_id` integer NOT NULL,
	`position` integer NOT NULL,
	`greek_word` text NOT NULL,
	`strong_id` text,
	`morph_code` text
);
--> statement-breakpoint
CREATE INDEX `idx_lxx_verse` ON `lxx_tokens` (`verse_id`);--> statement-breakpoint
CREATE INDEX `idx_lxx_strong` ON `lxx_tokens` (`strong_id`);--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`verse_id` integer NOT NULL,
	`content` text NOT NULL,
	`updated_at` text NOT NULL,
	`synced` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `reading_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`book_id` integer NOT NULL,
	`last_chapter` integer DEFAULT 1 NOT NULL,
	`last_verse` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `strong_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`language` text NOT NULL,
	`original_word` text NOT NULL,
	`transliteration` text NOT NULL,
	`pronunciation` text,
	`definition_pt` text,
	`definition_en` text NOT NULL,
	`kjv_usage` text,
	`root_words` text,
	`occurrence_count` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `verse_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`verse_id` integer NOT NULL,
	`position` integer NOT NULL,
	`word_surface` text NOT NULL,
	`strong_id` text,
	`morph_code` text,
	`original_word` text
);
--> statement-breakpoint
CREATE INDEX `idx_tokens_verse` ON `verse_tokens` (`verse_id`);--> statement-breakpoint
CREATE INDEX `idx_tokens_strong` ON `verse_tokens` (`strong_id`);--> statement-breakpoint
CREATE TABLE `verses` (
	`id` integer PRIMARY KEY NOT NULL,
	`book_id` integer NOT NULL,
	`chapter` integer NOT NULL,
	`verse` integer NOT NULL,
	`translation` text NOT NULL,
	`text` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_verse` ON `verses` (`book_id`,`chapter`,`verse`,`translation`);--> statement-breakpoint
CREATE INDEX `idx_verses_book` ON `verses` (`book_id`,`chapter`);--> statement-breakpoint
CREATE INDEX `idx_verses_translation` ON `verses` (`translation`);