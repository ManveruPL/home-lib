import { z } from 'zod';

import { OWNERSHIP_STATUSES, READING_STATUSES } from '@/constants/enums';
import { isValidIsbn, normalizeIsbn } from '@/lib/isbn';

// Error messages are i18n keys, translated where the error is displayed.
// Text inputs hold strings; empty strings become NULL when saved (see book-repository).

/** An author on the form: an existing record (id) or a new one created on save. */
export const authorRefSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().trim().min(1),
  /** Open Library key from a lookup, used to fetch the biography after saving. */
  openLibraryKey: z.string().optional(),
});
export type AuthorRef = z.infer<typeof authorRefSchema>;

export const genreRefSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().trim().min(1),
});
export type GenreRef = z.infer<typeof genreRefSchema>;

export const bookFormSchema = z.object({
  isbn: z
    .string()
    .trim()
    .refine(
      (v) => v === '' || /^(\d{13}|\d{9}[\dXx])$/.test(normalizeIsbn(v)),
      'validation.isbnFormat',
    )
    .refine((v) => v === '' || isValidIsbn(v), 'validation.isbnChecksum'),
  title: z.string().trim().min(1, 'validation.required').max(255, 'validation.titleTooLong'),
  subtitle: z.string(),
  authors: z.array(authorRefSchema).min(1, 'validation.atLeastOneAuthor'),
  genres: z.array(genreRefSchema),
  publisher: z.string(),
  publicationDate: z
    .string()
    .trim()
    .regex(/^(\d{4}(-\d{2}(-\d{2})?)?)?$/, 'validation.dateFormat'),
  description: z.string(),
  pageCount: z
    .string()
    .trim()
    .refine((v) => v === '' || (/^\d+$/.test(v) && Number(v) > 0), 'validation.positiveInteger'),
  coverImage: z.string(),
  language: z.string().trim().max(10, 'validation.languageTooLong'),
  ownershipStatus: z.enum(OWNERSHIP_STATUSES),
  readingStatus: z.enum(READING_STATUSES),
  personalRating: z.number().int().min(1).max(5).nullable(),
  physicalLocation: z.string(),
  personalNotes: z.string(),
});

export type BookFormValues = z.infer<typeof bookFormSchema>;

export const bookFormDefaults: BookFormValues = {
  isbn: '',
  title: '',
  subtitle: '',
  authors: [],
  genres: [],
  publisher: '',
  publicationDate: '',
  description: '',
  pageCount: '',
  coverImage: '',
  language: '',
  ownershipStatus: 'OWNED',
  readingStatus: 'TO_READ',
  personalRating: null,
  physicalLocation: '',
  personalNotes: '',
};
