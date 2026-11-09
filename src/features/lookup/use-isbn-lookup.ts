import { useMutation } from '@tanstack/react-query';

import { lookupIsbn } from './lookup-isbn';

export function useIsbnLookup() {
  return useMutation({ mutationFn: lookupIsbn });
}
