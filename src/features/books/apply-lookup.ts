import type { Author } from '@/db/schema';
import { normalizeForCompare } from '@/lib/text';

import type { LookupResult } from '../lookup/types';

import { bookFormDefaults, type AuthorRef, type BookFormValues } from './book-form-schema';

/** Links lookup authors to cataloged authors by name; unknown ones are created on save. */
export function matchLookupAuthors(result: LookupResult, known: Author[]): AuthorRef[] {
  const byName = new Map(known.map((a) => [normalizeForCompare(a.name), a]));
  return result.authors.map(({ name, openLibraryKey }) => {
    const match = byName.get(normalizeForCompare(name));
    return match ? { id: match.id, name: match.name } : { name, openLibraryKey };
  });
}

/**
 * Prefills the form with lookup data. Fields the lookup has overwrite the form; authors and
 * language are only filled when the user has not set them yet.
 */
export function applyLookup(
  values: BookFormValues,
  result: LookupResult,
  knownAuthors: Author[],
): BookFormValues {
  return {
    ...values,
    isbn: result.isbn,
    title: result.title,
    subtitle: result.subtitle ?? values.subtitle,
    publisher: result.publisher ?? values.publisher,
    publicationDate: result.publicationDate ?? values.publicationDate,
    description: result.description ?? values.description,
    pageCount: result.pageCount ? String(result.pageCount) : values.pageCount,
    coverImage: result.coverUrl ?? values.coverImage,
    language: values.language || result.language || '',
    authors: values.authors.length ? values.authors : matchLookupAuthors(result, knownAuthors),
  };
}

/** Form values for a book created straight from a scan (Quick Scan). */
export function lookupToFormValues(result: LookupResult, knownAuthors: Author[]): BookFormValues {
  return applyLookup(bookFormDefaults, result, knownAuthors);
}
