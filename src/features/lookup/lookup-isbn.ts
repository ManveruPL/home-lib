import { normalizeIsbn } from '@/lib/isbn';

import { lookupEIsbn } from './e-isbn';
import { lookupOpenLibrary } from './open-library';
import type { LookupResult, LookupSource } from './types';

const SOURCES: LookupSource[] = [lookupEIsbn, lookupOpenLibrary];

/** Thrown when no source could be reached, e.g. offline. */
export class LookupUnavailableError extends Error {
  constructor(cause: unknown) {
    super('No ISBN lookup source could be reached', { cause });
    this.name = 'LookupUnavailableError';
  }
}

/**
 * Queries e-ISBN first, then Open Library. Returns null when no source finds the ISBN and throws
 * LookupUnavailableError when every source failed with an error.
 */
export async function lookupIsbn(rawIsbn: string): Promise<LookupResult | null> {
  const isbn = normalizeIsbn(rawIsbn);
  let failures = 0;
  let lastError: unknown;

  for (const source of SOURCES) {
    try {
      const result = await source(isbn);
      if (result) return result;
    } catch (error) {
      // One source failing should not block the fallback.
      console.warn('ISBN lookup source failed', error);
      failures++;
      lastError = error;
    }
  }

  if (failures === SOURCES.length) throw new LookupUnavailableError(lastError);
  return null;
}
