import { z } from 'zod';

import { OWNERSHIP_STATUSES, READING_STATUSES } from '@/constants/enums';

/** 2 added embedded covers; version 1 files (no covers) can still be restored. */
export const BACKUP_VERSION = 2;

const nullableText = z.string().nullable();

const authorRecord = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  biography: nullableText,
  birthDate: nullableText,
  deathDate: nullableText,
});

const genreRecord = z.object({
  id: z.number().int(),
  name: z.string().min(1),
});

const bookRecord = z.object({
  id: z.number().int(),
  title: z.string().min(1),
  subtitle: nullableText,
  isbn: nullableText,
  publisher: nullableText,
  publicationDate: nullableText,
  description: nullableText,
  pageCount: z.number().int().nullable(),
  coverImage: nullableText,
  language: nullableText,
  ownershipStatus: z.enum(OWNERSHIP_STATUSES),
  readingStatus: z.enum(READING_STATUSES),
  personalRating: z.number().int().min(1).max(5).nullable(),
  physicalLocation: nullableText,
  personalNotes: nullableText,
  dateCataloged: z.string().min(1),
});

export const backupSchema = z.object({
  version: z.union([z.literal(1), z.literal(2)]),
  exportedAt: z.string(),
  authors: z.array(authorRecord),
  genres: z.array(genreRecord),
  books: z.array(bookRecord),
  book_authors: z.array(z.object({ bookId: z.number().int(), authorId: z.number().int() })),
  book_genres: z.array(z.object({ bookId: z.number().int(), genreId: z.number().int() })),
  /** Cover images keyed by the backup book id (as a string, since JSON keys are strings). */
  covers: z
    .record(
      z.string(),
      z.object({ mimeType: z.string().startsWith('image/'), data: z.string().min(1) }),
    )
    .optional(),
});

export type BackupPayload = z.infer<typeof backupSchema>;

export type RestoreSummary = {
  booksAdded: number;
  booksSkipped: number;
  authorsAdded: number;
  genresAdded: number;
  coversRestored: number;
};
