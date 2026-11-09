import { eq, inArray } from 'drizzle-orm';

import { db } from '@/db/client';
import {
  authors,
  bookAuthors,
  bookGenres,
  books,
  genres,
  type Author,
  type Book,
  type Genre,
} from '@/db/schema';
import type { Transaction } from '@/db/types';
import { isbnVariants, normalizeIsbn } from '@/lib/isbn';
import { emptyToNull, normalizeForCompare } from '@/lib/text';

import { enrichAuthors } from '../authors/author-repository';
import { findOrCreateGenre } from '../genres/genre-repository';

import type { AuthorRef, BookFormValues, GenreRef } from './book-form-schema';
import { cacheCover, deleteCachedCover } from './covers';

export type BookWithRelations = Book & { authors: Author[]; genres: Genre[] };

async function loadRelations(bookIds?: number[]) {
  const authorQuery = db
    .select({ bookId: bookAuthors.bookId, author: authors })
    .from(bookAuthors)
    .innerJoin(authors, eq(authors.id, bookAuthors.authorId));
  const genreQuery = db
    .select({ bookId: bookGenres.bookId, genre: genres })
    .from(bookGenres)
    .innerJoin(genres, eq(genres.id, bookGenres.genreId));

  const [authorLinks, genreLinks] = await Promise.all([
    bookIds ? authorQuery.where(inArray(bookAuthors.bookId, bookIds)) : authorQuery,
    bookIds ? genreQuery.where(inArray(bookGenres.bookId, bookIds)) : genreQuery,
  ]);

  const authorsByBook = new Map<number, Author[]>();
  // Junction rows come back in insertion order, which keeps the author order from the form.
  for (const { bookId, author } of authorLinks) {
    authorsByBook.set(bookId, [...(authorsByBook.get(bookId) ?? []), author]);
  }
  const genresByBook = new Map<number, Genre[]>();
  for (const { bookId, genre } of genreLinks) {
    genresByBook.set(bookId, [...(genresByBook.get(bookId) ?? []), genre]);
  }
  return { authorsByBook, genresByBook };
}

export async function getBooks(): Promise<BookWithRelations[]> {
  const [rows, { authorsByBook, genresByBook }] = await Promise.all([
    db.select().from(books),
    loadRelations(),
  ]);
  return rows.map((book) => ({
    ...book,
    authors: authorsByBook.get(book.id) ?? [],
    genres: genresByBook.get(book.id) ?? [],
  }));
}

export async function getBook(id: number): Promise<BookWithRelations | null> {
  const [row] = await db.select().from(books).where(eq(books.id, id));
  if (!row) return null;
  const { authorsByBook, genresByBook } = await loadRelations([id]);
  return { ...row, authors: authorsByBook.get(id) ?? [], genres: genresByBook.get(id) ?? [] };
}

/** Finds a book with the same ISBN in any spelling (ISBN-10/13, with or without hyphens). */
export async function findBookIdByIsbn(isbn: string): Promise<number | null> {
  const variants = isbnVariants(isbn);
  if (!variants.length) return null;
  const [row] = await db
    .select({ id: books.id })
    .from(books)
    .where(inArray(books.isbn, variants))
    .limit(1);
  return row?.id ?? null;
}

function resolveAuthorIds(tx: Transaction, refs: AuthorRef[]) {
  const existing = tx.select({ id: authors.id, name: authors.name }).from(authors).all();
  const knownIds = new Set(existing.map((a) => a.id));
  const idsByName = new Map(existing.map((a) => [normalizeForCompare(a.name), a.id]));

  const ids: number[] = [];
  const created: { id: number; openLibraryKey?: string }[] = [];
  for (const ref of refs) {
    const key = normalizeForCompare(ref.name);
    let id = ref.id !== undefined && knownIds.has(ref.id) ? ref.id : idsByName.get(key);
    if (id === undefined) {
      id = tx
        .insert(authors)
        .values({ name: ref.name.trim() })
        .returning({ id: authors.id })
        .get().id;
      idsByName.set(key, id);
      created.push({ id, openLibraryKey: ref.openLibraryKey });
    }
    if (!ids.includes(id)) ids.push(id);
  }
  return { ids, created };
}

function resolveGenreIds(tx: Transaction, refs: GenreRef[]): number[] {
  const ids = refs.map((ref) => findOrCreateGenre(tx, ref.name).id);
  return [...new Set(ids)];
}

function toBookRow(values: BookFormValues, coverImage: string | null) {
  return {
    isbn: values.isbn.trim() ? normalizeIsbn(values.isbn) : null,
    title: values.title.trim(),
    subtitle: emptyToNull(values.subtitle),
    publisher: emptyToNull(values.publisher),
    publicationDate: emptyToNull(values.publicationDate),
    description: emptyToNull(values.description),
    pageCount: values.pageCount.trim() ? Number(values.pageCount) : null,
    coverImage,
    language: emptyToNull(values.language),
    ownershipStatus: values.ownershipStatus,
    readingStatus: values.readingStatus,
    personalRating: values.personalRating,
    physicalLocation: emptyToNull(values.physicalLocation),
    personalNotes: emptyToNull(values.personalNotes),
  };
}

/**
 * Creates (no bookId) or updates a book with its authors and genres in one transaction, creating
 * missing authors and genres on the way. Returns the book id.
 */
export async function saveBook(values: BookFormValues, bookId?: number): Promise<number> {
  const previous = bookId ? await getBook(bookId) : null;
  const requestedCover = emptyToNull(values.coverImage);
  const coverImage =
    requestedCover === previous?.coverImage ? requestedCover : await cacheCover(requestedCover);

  const { id, createdAuthors } = db.transaction((tx) => {
    const { ids: authorIds, created } = resolveAuthorIds(tx, values.authors);
    const genreIds = resolveGenreIds(tx, values.genres);
    const row = toBookRow(values, coverImage);

    let id: number;
    if (bookId) {
      tx.update(books).set(row).where(eq(books.id, bookId)).run();
      tx.delete(bookAuthors).where(eq(bookAuthors.bookId, bookId)).run();
      tx.delete(bookGenres).where(eq(bookGenres.bookId, bookId)).run();
      id = bookId;
    } else {
      id = tx
        .insert(books)
        .values({ ...row, dateCataloged: new Date().toISOString() })
        .returning({ id: books.id })
        .get().id;
    }

    if (authorIds.length) {
      tx.insert(bookAuthors)
        .values(authorIds.map((authorId) => ({ bookId: id, authorId })))
        .run();
    }
    if (genreIds.length) {
      tx.insert(bookGenres)
        .values(genreIds.map((genreId) => ({ bookId: id, genreId })))
        .run();
    }
    return { id, createdAuthors: created };
  });

  if (previous?.coverImage && previous.coverImage !== coverImage) {
    deleteCachedCover(previous.coverImage);
  }
  void enrichAuthors(createdAuthors);
  return id;
}

export async function deleteBook(id: number): Promise<void> {
  const book = await getBook(id);
  // Junction rows are removed by ON DELETE CASCADE.
  db.delete(books).where(eq(books.id, id)).run();
  deleteCachedCover(book?.coverImage);
}

export function bookToFormValues(book: BookWithRelations): BookFormValues {
  return {
    isbn: book.isbn ?? '',
    title: book.title,
    subtitle: book.subtitle ?? '',
    authors: book.authors.map((a) => ({ id: a.id, name: a.name })),
    genres: book.genres.map((g) => ({ id: g.id, name: g.name })),
    publisher: book.publisher ?? '',
    publicationDate: book.publicationDate ?? '',
    description: book.description ?? '',
    pageCount: book.pageCount ? String(book.pageCount) : '',
    coverImage: book.coverImage ?? '',
    language: book.language ?? '',
    ownershipStatus: book.ownershipStatus,
    readingStatus: book.readingStatus,
    personalRating: book.personalRating,
    physicalLocation: book.physicalLocation ?? '',
    personalNotes: book.personalNotes ?? '',
  };
}
