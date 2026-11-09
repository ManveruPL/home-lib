import { useDbQuery } from '@/db/use-db-query';

import { getAuthor, listAuthors } from './author-repository';

export function useAuthors() {
  return useDbQuery(listAuthors, ['authors'], []);
}

export function useAuthor(id: number) {
  return useDbQuery(() => getAuthor(id), ['authors'], [id]);
}
