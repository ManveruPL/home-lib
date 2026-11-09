import type { OwnershipStatus, ReadingStatus } from '@/constants/enums';
import { compareText } from '@/lib/collator';
import { foldText } from '@/lib/text';

import type { BookWithRelations } from './book-repository';

export const SORT_KEYS = [
  'dateAdded_desc',
  'dateAdded_asc',
  'title_asc',
  'title_desc',
  'author_asc',
  'author_desc',
  'rating_desc',
  'pages_asc',
  'pages_desc',
] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export type BookFilters = {
  authorId: number | null;
  /** A book matches when it has any of these genres. */
  genreIds: number[];
  readingStatuses: ReadingStatus[];
  ownership: OwnershipStatus | 'ALL';
};

export const emptyFilters: BookFilters = {
  authorId: null,
  genreIds: [],
  readingStatuses: [],
  ownership: 'ALL',
};

export function countActiveFilters(filters: BookFilters): number {
  return (
    (filters.authorId !== null ? 1 : 0) +
    (filters.genreIds.length ? 1 : 0) +
    (filters.readingStatuses.length ? 1 : 0) +
    (filters.ownership !== 'ALL' ? 1 : 0)
  );
}

// Folded search text per book object; books are re-created on every DB change, so this never
// goes stale.
const haystacks = new WeakMap<BookWithRelations, string>();

function haystack(book: BookWithRelations): string {
  let text = haystacks.get(book);
  if (text === undefined) {
    text = foldText(
      [book.title, book.subtitle ?? '', book.isbn ?? '', ...book.authors.map((a) => a.name)].join(
        '\n',
      ),
    );
    haystacks.set(book, text);
  }
  return text;
}

/** Matches every word of the query against title, subtitle, author names and ISBN. */
export function searchBooks(books: BookWithRelations[], query: string): BookWithRelations[] {
  const words = foldText(query)
    .split(/\s+/)
    .map((word) => (/^[\d-]+x?$/.test(word) ? word.replace(/-/g, '') : word))
    .filter(Boolean);
  if (!words.length) return books;
  return books.filter((book) => {
    const text = haystack(book);
    return words.every((word) => text.includes(word));
  });
}

export function filterBooks(books: BookWithRelations[], filters: BookFilters): BookWithRelations[] {
  return books.filter(
    (book) =>
      (filters.authorId === null || book.authors.some((a) => a.id === filters.authorId)) &&
      (!filters.genreIds.length || book.genres.some((g) => filters.genreIds.includes(g.id))) &&
      (!filters.readingStatuses.length || filters.readingStatuses.includes(book.readingStatus)) &&
      (filters.ownership === 'ALL' || book.ownershipStatus === filters.ownership),
  );
}

function firstAuthor(book: BookWithRelations): string {
  return book.authors[0]?.name ?? '';
}

/** Compares nullable numbers, always putting missing values last. */
function compareNullable(a: number | null, b: number | null, direction: 1 | -1): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return (a - b) * direction;
}

export function sortBooks(books: BookWithRelations[], sort: SortKey): BookWithRelations[] {
  const byTitle = (a: BookWithRelations, b: BookWithRelations) => compareText(a.title, b.title);
  const comparators: Record<SortKey, (a: BookWithRelations, b: BookWithRelations) => number> = {
    dateAdded_desc: (a, b) => b.dateCataloged.localeCompare(a.dateCataloged),
    dateAdded_asc: (a, b) => a.dateCataloged.localeCompare(b.dateCataloged),
    title_asc: byTitle,
    title_desc: (a, b) => byTitle(b, a),
    author_asc: (a, b) => compareText(firstAuthor(a), firstAuthor(b)) || byTitle(a, b),
    author_desc: (a, b) => compareText(firstAuthor(b), firstAuthor(a)) || byTitle(a, b),
    rating_desc: (a, b) => compareNullable(a.personalRating, b.personalRating, -1) || byTitle(a, b),
    pages_asc: (a, b) => compareNullable(a.pageCount, b.pageCount, 1) || byTitle(a, b),
    pages_desc: (a, b) => compareNullable(a.pageCount, b.pageCount, -1) || byTitle(a, b),
  };
  return [...books].sort(comparators[sort]);
}
