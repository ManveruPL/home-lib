import { describe, expect, it } from '@jest/globals';

import {
  isBooklandEan,
  isbnVariants,
  isValidIsbn,
  normalizeIsbn,
  toIsbn10,
  toIsbn13,
} from './isbn';

describe('isbn', () => {
  it('normalizes hyphens, spaces and a lowercase check digit', () => {
    expect(normalizeIsbn(' 0-8044-2957-x ')).toBe('080442957X');
  });

  it('validates ISBN-10 and ISBN-13 checksums', () => {
    expect(isValidIsbn('0-14-032872-6')).toBe(true);
    expect(isValidIsbn('080442957X')).toBe(true);
    expect(isValidIsbn('9780140328721')).toBe(true);
    expect(isValidIsbn('9780140328722')).toBe(false);
    expect(isValidIsbn('0140328727')).toBe(false);
    expect(isValidIsbn('123')).toBe(false);
  });

  it('converts between ISBN-10 and ISBN-13', () => {
    expect(toIsbn13('0140328726')).toBe('9780140328721');
    expect(toIsbn10('9780140328721')).toBe('0140328726');
    expect(toIsbn10('9780804429573')).toBe('080442957X');
    // 979 ISBNs have no ISBN-10 form.
    expect(toIsbn10('9791032305690')).toBeNull();
    expect(toIsbn13('not an isbn')).toBeNull();
  });

  it('lists every spelling for duplicate detection', () => {
    expect(isbnVariants('0-14-032872-6').sort()).toEqual(['0140328726', '9780140328721']);
  });

  it('accepts only Bookland EAN-13 barcodes', () => {
    expect(isBooklandEan('9788380432239')).toBe(true);
    expect(isBooklandEan('5901234123457')).toBe(false); // valid EAN, not a book
    expect(isBooklandEan('9788380432238')).toBe(false); // bad checksum
  });
});
