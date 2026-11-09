import { useDbQuery } from '@/db/use-db-query';

import { listGenres } from './genre-repository';

export function useGenres() {
  return useDbQuery(listGenres, ['genres'], []);
}
