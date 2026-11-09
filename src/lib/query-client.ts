import { QueryClient } from '@tanstack/react-query';

// Server state here is only the external ISBN lookup APIs; local data comes from SQLite live queries.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});
