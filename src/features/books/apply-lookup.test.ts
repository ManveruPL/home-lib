import { describe, expect, it } from '@jest/globals';

import type { LookupResult } from '../lookup/types';

import { applyLookup, lookupToFormValues } from './apply-lookup';
import { bookFormDefaults } from './book-form-schema';

const result: LookupResult = {
  source: 'open-library',
  isbn: '9780140328721',
  title: 'Fantastic Mr. Fox',
  subtitle: "A Children's Story",
  authors: [{ name: 'Roald Dahl', openLibraryKey: 'OL34184A' }, { name: 'Quentin Blake' }],
  publisher: 'Puffin',
  publicationDate: '1988',
  pageCount: 96,
  coverUrl: 'https://covers.openlibrary.org/b/id/8231856-L.jpg',
};

const knownAuthors = [
  { id: 7, name: 'Quentin  Blake', biography: null, birthDate: null, deathDate: null },
];

describe('applyLookup', () => {
  it('fills the form and links known authors by name', () => {
    const values = lookupToFormValues(result, knownAuthors);
    expect(values).toMatchObject({
      isbn: '9780140328721',
      title: 'Fantastic Mr. Fox',
      publisher: 'Puffin',
      pageCount: '96',
      coverImage: result.coverUrl,
      ownershipStatus: 'OWNED',
      readingStatus: 'TO_READ',
      authors: [
        { name: 'Roald Dahl', openLibraryKey: 'OL34184A' },
        { id: 7, name: 'Quentin  Blake' },
      ],
    });
  });

  it('keeps authors, language and personal fields the user already set', () => {
    const edited = {
      ...bookFormDefaults,
      authors: [{ id: 1, name: 'Someone' }],
      language: 'en',
      personalNotes: 'Signed copy',
      description: 'My own description',
    };
    const values = applyLookup(edited, { ...result, language: 'pl' }, knownAuthors);
    expect(values.authors).toEqual([{ id: 1, name: 'Someone' }]);
    expect(values.language).toBe('en');
    expect(values.personalNotes).toBe('Signed copy');
    // Fields missing from the lookup are left alone.
    expect(values.description).toBe('My own description');
  });
});
