import { addDatabaseChangeListener } from 'expo-sqlite';
import { useEffect, useState } from 'react';

type TableName = 'books' | 'authors' | 'genres' | 'book_authors' | 'book_genres';

type QueryState<T> = {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
};

/**
 * Runs `query` and re-runs it whenever a row in one of `tables` changes. Unlike Drizzle's
 * useLiveQuery it also reacts to changes in joined tables, which the book queries rely on.
 */
export function useDbQuery<T>(
  query: () => Promise<T>,
  tables: TableName[],
  deps: unknown[],
): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({
    data: undefined,
    error: undefined,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;
    let scheduled: ReturnType<typeof setTimeout> | undefined;

    const run = () => {
      query().then(
        (data) => !cancelled && setState({ data, error: undefined, isLoading: false }),
        (error: Error) => !cancelled && setState((s) => ({ ...s, error, isLoading: false })),
      );
    };

    run();

    const subscription = addDatabaseChangeListener(({ tableName }) => {
      if (!tables.includes(tableName as TableName)) return;
      // A single save touches many rows; coalesce them into one re-query.
      clearTimeout(scheduled);
      scheduled = setTimeout(run, 16);
    });

    return () => {
      cancelled = true;
      clearTimeout(scheduled);
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
