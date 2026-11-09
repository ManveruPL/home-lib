import { useDbQuery } from '@/db/use-db-query';

import { getBook, getBooks } from './book-repository';

const BOOK_TABLES = ['books', 'authors', 'genres', 'book_authors', 'book_genres'] as const;

export function useBooks() {
  return useDbQuery(getBooks, [...BOOK_TABLES], []);
}

export function useBook(id: number) {
  return useDbQuery(() => getBook(id), [...BOOK_TABLES], [id]);
}
