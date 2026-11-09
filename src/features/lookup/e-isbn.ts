import { toIsbn13 } from '@/lib/isbn';

import { parseOnixProduct } from './onix';
import type { LookupSource } from './types';

/**
 * Primary source: Polish e-ISBN registry (Biblioteka Narodowa). No authorization required.
 * Docs: .ai-data/Dokumentacja_API.pdf
 */
const API_URL = 'https://e-isbn.pl/IsbnWeb/api.xml';

export const lookupEIsbn: LookupSource = async (isbn) => {
  // The API only accepts 13-digit ISBNs without hyphens.
  const isbn13 = toIsbn13(isbn);
  if (!isbn13) return null;

  const res = await fetch(`${API_URL}?isbn=${isbn13}`);
  if (!res.ok) throw new Error(`e-ISBN responded with ${res.status}`);

  return parseOnixProduct(await res.text(), isbn13);
};
