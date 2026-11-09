/** Strips spaces and hyphens and uppercases a trailing ISBN-10 check digit. */
export function normalizeIsbn(raw: string): string {
  return raw.replace(/[\s-]/g, '').toUpperCase();
}

export function isValidIsbn10(isbn: string): boolean {
  if (!/^\d{9}[\dX]$/.test(isbn)) return false;
  const sum = [...isbn].reduce((acc, ch, i) => acc + (ch === 'X' ? 10 : Number(ch)) * (10 - i), 0);
  return sum % 11 === 0;
}

export function isValidIsbn13(isbn: string): boolean {
  if (!/^\d{13}$/.test(isbn)) return false;
  const sum = [...isbn].reduce((acc, ch, i) => acc + Number(ch) * (i % 2 === 0 ? 1 : 3), 0);
  return sum % 10 === 0;
}

export function isValidIsbn(raw: string): boolean {
  const isbn = normalizeIsbn(raw);
  return isValidIsbn10(isbn) || isValidIsbn13(isbn);
}

/** Converts a valid ISBN-10 to ISBN-13; returns ISBN-13 input unchanged and null for anything else. */
export function toIsbn13(raw: string): string | null {
  const isbn = normalizeIsbn(raw);
  if (isValidIsbn13(isbn)) return isbn;
  if (!isValidIsbn10(isbn)) return null;

  const body = `978${isbn.slice(0, 9)}`;
  const sum = [...body].reduce((acc, ch, i) => acc + Number(ch) * (i % 2 === 0 ? 1 : 3), 0);
  return body + ((10 - (sum % 10)) % 10);
}

/** Converts a 978-prefixed ISBN-13 to ISBN-10; null when there is no ISBN-10 form. */
export function toIsbn10(raw: string): string | null {
  const isbn = normalizeIsbn(raw);
  if (isValidIsbn10(isbn)) return isbn;
  if (!isValidIsbn13(isbn) || !isbn.startsWith('978')) return null;

  const body = isbn.slice(3, 12);
  const sum = [...body].reduce((acc, ch, i) => acc + Number(ch) * (10 - i), 0);
  const check = (11 - (sum % 11)) % 11;
  return body + (check === 10 ? 'X' : String(check));
}

/** All spellings of the same ISBN (as typed, ISBN-10, ISBN-13), for duplicate detection. */
export function isbnVariants(raw: string): string[] {
  const isbn = normalizeIsbn(raw);
  return [...new Set([isbn, toIsbn10(isbn), toIsbn13(isbn)].filter((v): v is string => !!v))];
}

/** True for EAN-13 barcodes that encode a book (Bookland prefixes 978/979). */
export function isBooklandEan(code: string): boolean {
  return /^97[89]\d{10}$/.test(code) && isValidIsbn13(code);
}
