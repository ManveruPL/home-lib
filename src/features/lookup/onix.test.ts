/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from '@jest/globals';

import { parseOnixProduct } from './onix';

// Real records from the e-ISBN API (September 2026).
const xml = readFileSync(join(__dirname, '__fixtures__', 'e-isbn-sample.xml'), 'utf8');

describe('parseOnixProduct', () => {
  it('returns null for an ISBN that is not in the message', () => {
    expect(parseOnixProduct(xml, '9780140328721')).toBeNull();
    expect(parseOnixProduct('<ONIXMessage><Header/></ONIXMessage>', '9788380432239')).toBeNull();
  });

  it('cleans catalogue punctuation and drops the publisher from the authors', () => {
    const book = parseOnixProduct(xml, '9788380432239');
    expect(book).toMatchObject({
      source: 'e-isbn',
      isbn: '9788380432239',
      title: 'Ojciec Święty Leon XIV u progu pontyfikatu',
      // "sylwetka duchowa /" in the record.
      subtitle: 'sylwetka duchowa',
      // Z99 contributors; "Wydawnictwo M" is the publisher and is filtered out.
      authors: [{ name: 'Przemysław Radzyński' }, { name: 'Leon' }],
      publisher: 'Wydawnictwo M, spółka z o.o.',
      publicationDate: '2025-12-30',
      language: 'pl',
    });
    expect(book?.subjects).toContain('Watykan');
  });

  it('falls back to other author roles and strips life dates', () => {
    const book = parseOnixProduct(xml, '9788365090607');
    // A44/A43 roles, recorded as "Korytko Jan (1925-)".
    expect(book?.authors).toEqual([{ name: 'Korytko Jan' }, { name: 'Oleksak Arkadiusz' }]);
    expect(book?.coverUrl).toMatch(/^https:\/\//);
  });

  it('maps the description without HTML and the front cover', () => {
    const book = parseOnixProduct(xml, '9788380539570');
    expect(book?.authors).toEqual([{ name: 'Agnieszka Lingas-Łoniewska' }]);
    expect(book?.description).toMatch(/^Dilerka Emocji/);
    expect(book?.description).not.toMatch(/<\/?(p|strong)>/);
    expect(book?.coverUrl).toContain('original.jpg');
  });

  it('reads the page count from the extent', () => {
    expect(parseOnixProduct(xml, '9788365026033')?.pageCount).toBe(36);
  });
});
