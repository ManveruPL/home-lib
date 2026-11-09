import { describe, expect, it } from '@jest/globals';

import type { Author, Genre } from '@/db/schema';

import {
  countActiveFilters,
  emptyFilters,
  filterBooks,
  searchBooks,
  sortBooks,
} from './book-filters';
import type { BookWithRelations } from './book-repository';

const author = (id: number, name: string): Author => ({
  id,
  name,
  biography: null,
  birthDate: null,
  deathDate: null,
});
const genre = (id: number, name: string): Genre => ({ id, name });

let nextId = 1;
function book(overrides: Partial<BookWithRelations>): BookWithRelations {
  return {
    id: nextId++,
    title: 'Untitled',
    subtitle: null,
    isbn: null,
    publisher: null,
    publicationDate: null,
    description: null,
    pageCount: null,
    coverImage: null,
    language: null,
    ownershipStatus: 'OWNED',
    readingStatus: 'TO_READ',
    personalRating: null,
    physicalLocation: null,
    personalNotes: null,
    dateCataloged: '2026-01-01T00:00:00.000Z',
    authors: [],
    genres: [],
    ...overrides,
  };
}

const lem = author(1, 'Stanisław Lem');
const tokarczuk = author(2, 'Olga Tokarczuk');
const scifi = genre(1, 'Science fiction');
const novel = genre(2, 'Powieść');

const solaris = book({
  title: 'Solaris',
  isbn: '9788308049341',
  authors: [lem],
  genres: [scifi],
  readingStatus: 'COMPLETED',
  personalRating: 5,
  pageCount: 340,
  dateCataloged: '2026-01-03T00:00:00.000Z',
});
const bieguni = book({
  title: 'Bieguni',
  authors: [tokarczuk],
  genres: [novel],
  ownershipStatus: 'WISHLIST',
  pageCount: 450,
  dateCataloged: '2026-01-02T00:00:00.000Z',
});
const lodz = book({
  title: 'Łódź nocą',
  subtitle: 'Przewodnik',
  readingStatus: 'READING',
  personalRating: 3,
});
const books = [solaris, bieguni, lodz];

describe('searchBooks', () => {
  it('returns everything for an empty query', () => {
    expect(searchBooks(books, '  ')).toBe(books);
  });

  it('matches title, author and subtitle ignoring case and Polish diacritics', () => {
    expect(searchBooks(books, 'SOLARIS')).toEqual([solaris]);
    expect(searchBooks(books, 'stanislaw')).toEqual([solaris]);
    expect(searchBooks(books, 'lodz')).toEqual([lodz]);
    expect(searchBooks(books, 'przewodnik')).toEqual([lodz]);
  });

  it('requires every word to match', () => {
    expect(searchBooks(books, 'lem solaris')).toEqual([solaris]);
    expect(searchBooks(books, 'lem bieguni')).toEqual([]);
  });

  it('matches an ISBN typed with hyphens', () => {
    expect(searchBooks(books, '978-83-08-04934-1')).toEqual([solaris]);
  });
});

describe('filterBooks', () => {
  it('filters by author, genre, status and ownership', () => {
    expect(filterBooks(books, { ...emptyFilters, authorId: lem.id })).toEqual([solaris]);
    expect(filterBooks(books, { ...emptyFilters, genreIds: [scifi.id, novel.id] })).toEqual([
      solaris,
      bieguni,
    ]);
    expect(filterBooks(books, { ...emptyFilters, readingStatuses: ['READING'] })).toEqual([lodz]);
    expect(filterBooks(books, { ...emptyFilters, ownership: 'WISHLIST' })).toEqual([bieguni]);
  });

  it('counts active filters', () => {
    expect(countActiveFilters(emptyFilters)).toBe(0);
    expect(countActiveFilters({ ...emptyFilters, genreIds: [1, 2], ownership: 'OWNED' })).toBe(2);
  });
});

describe('sortBooks', () => {
  const titles = (list: BookWithRelations[]) => list.map((b) => b.title);

  it('sorts titles with Polish collation (Ł after L, not after Z)', () => {
    expect(titles(sortBooks(books, 'title_asc'))).toEqual(['Bieguni', 'Łódź nocą', 'Solaris']);
  });

  it('sorts by date added, newest first', () => {
    expect(titles(sortBooks(books, 'dateAdded_desc'))).toEqual(['Solaris', 'Bieguni', 'Łódź nocą']);
  });

  it('puts unrated and unknown page counts last', () => {
    expect(titles(sortBooks(books, 'rating_desc'))).toEqual(['Solaris', 'Łódź nocą', 'Bieguni']);
    expect(titles(sortBooks(books, 'pages_asc'))).toEqual(['Solaris', 'Bieguni', 'Łódź nocą']);
    expect(titles(sortBooks(books, 'pages_desc'))).toEqual(['Bieguni', 'Solaris', 'Łódź nocą']);
  });

  it('does not mutate the input', () => {
    const copy = [...books];
    sortBooks(books, 'title_desc');
    expect(books).toEqual(copy);
  });
});
