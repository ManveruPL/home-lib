import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { OWNERSHIP_STATUSES, READING_STATUSES } from '@/constants/enums';

export const authors = sqliteTable(
  'authors',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    biography: text('biography'),
    // ISO 8601 (YYYY-MM-DD) or year (YYYY)
    birthDate: text('birth_date'),
    // ISO 8601 or year; null if alive
    deathDate: text('death_date'),
  },
  (t) => [index('idx_authors_name').on(t.name)],
);

export const genres = sqliteTable(
  'genres',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
  },
  (t) => [uniqueIndex('idx_genres_name').on(t.name)],
);

export const books = sqliteTable(
  'books',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    subtitle: text('subtitle'),
    // ISBN-10 or ISBN-13
    isbn: text('isbn'),
    publisher: text('publisher'),
    // ISO 8601 or year
    publicationDate: text('publication_date'),
    description: text('description'),
    pageCount: integer('page_count'),
    // URI pointing to local disk or remote source
    coverImage: text('cover_image'),
    // Language code, e.g. 'pl', 'en'
    language: text('language'),
    ownershipStatus: text('ownership_status', { enum: OWNERSHIP_STATUSES }).notNull(),
    readingStatus: text('reading_status', { enum: READING_STATUSES }).notNull(),
    // 1-5 stars; null if unrated
    personalRating: integer('personal_rating'),
    physicalLocation: text('physical_location'),
    personalNotes: text('personal_notes'),
    // ISO 8601 timestamp
    dateCataloged: text('date_cataloged').notNull(),
  },
  (t) => [index('idx_books_isbn').on(t.isbn), index('idx_books_title').on(t.title)],
);

export const bookAuthors = sqliteTable(
  'book_authors',
  {
    bookId: integer('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    authorId: integer('author_id')
      .notNull()
      .references(() => authors.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.bookId, t.authorId] })],
);

export const bookGenres = sqliteTable(
  'book_genres',
  {
    bookId: integer('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    genreId: integer('genre_id')
      .notNull()
      .references(() => genres.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.bookId, t.genreId] })],
);

export const booksRelations = relations(books, ({ many }) => ({
  bookAuthors: many(bookAuthors),
  bookGenres: many(bookGenres),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  bookAuthors: many(bookAuthors),
}));

export const genresRelations = relations(genres, ({ many }) => ({
  bookGenres: many(bookGenres),
}));

export const bookAuthorsRelations = relations(bookAuthors, ({ one }) => ({
  book: one(books, { fields: [bookAuthors.bookId], references: [books.id] }),
  author: one(authors, { fields: [bookAuthors.authorId], references: [authors.id] }),
}));

export const bookGenresRelations = relations(bookGenres, ({ one }) => ({
  book: one(books, { fields: [bookGenres.bookId], references: [books.id] }),
  genre: one(genres, { fields: [bookGenres.genreId], references: [genres.id] }),
}));

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type Author = typeof authors.$inferSelect;
export type NewAuthor = typeof authors.$inferInsert;
export type Genre = typeof genres.$inferSelect;
export type NewGenre = typeof genres.$inferInsert;
