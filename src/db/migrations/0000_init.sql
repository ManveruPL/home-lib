CREATE TABLE `authors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`biography` text,
	`birth_date` text,
	`death_date` text
);
--> statement-breakpoint
CREATE INDEX `idx_authors_name` ON `authors` (`name`);--> statement-breakpoint
CREATE TABLE `book_authors` (
	`book_id` integer NOT NULL,
	`author_id` integer NOT NULL,
	PRIMARY KEY(`book_id`, `author_id`),
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `book_genres` (
	`book_id` integer NOT NULL,
	`genre_id` integer NOT NULL,
	PRIMARY KEY(`book_id`, `genre_id`),
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `books` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`subtitle` text,
	`isbn` text,
	`publisher` text,
	`publication_date` text,
	`description` text,
	`page_count` integer,
	`cover_image` text,
	`language` text,
	`ownership_status` text NOT NULL,
	`reading_status` text NOT NULL,
	`personal_rating` integer,
	`physical_location` text,
	`personal_notes` text,
	`date_cataloged` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_books_isbn` ON `books` (`isbn`);--> statement-breakpoint
CREATE INDEX `idx_books_title` ON `books` (`title`);--> statement-breakpoint
CREATE TABLE `genres` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_genres_name` ON `genres` (`name`);