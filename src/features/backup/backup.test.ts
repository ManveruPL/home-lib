import { describe, expect, it } from '@jest/globals';

import { InvalidBackupError, parseBackup } from './parse-backup';
import { BACKUP_VERSION, type BackupPayload } from './types';

const valid: BackupPayload = {
  version: BACKUP_VERSION,
  exportedAt: '2026-07-12T22:28:00Z',
  authors: [
    { id: 1, name: 'Stanisław Lem', biography: null, birthDate: '1921', deathDate: '2006' },
  ],
  genres: [{ id: 1, name: 'Science fiction' }],
  books: [
    {
      id: 1,
      title: 'Solaris',
      subtitle: null,
      isbn: '9788308049341',
      publisher: null,
      publicationDate: '2012',
      description: null,
      pageCount: 340,
      coverImage: null,
      language: 'pl',
      ownershipStatus: 'OWNED',
      readingStatus: 'COMPLETED',
      personalRating: 5,
      physicalLocation: null,
      personalNotes: null,
      dateCataloged: '2026-01-03T00:00:00.000Z',
    },
  ],
  book_authors: [{ bookId: 1, authorId: 1 }],
  book_genres: [{ bookId: 1, genreId: 1 }],
};

describe('parseBackup', () => {
  it('accepts a valid backup', () => {
    expect(parseBackup(JSON.stringify(valid))).toEqual(valid);
  });

  it('rejects files that are not JSON', () => {
    expect(() => parseBackup('not json')).toThrow(InvalidBackupError);
  });

  it('accepts version 1 backups, which have no covers', () => {
    const v1 = { ...valid, version: 1 };
    expect(parseBackup(JSON.stringify(v1)).covers).toBeUndefined();
  });

  it('accepts embedded covers keyed by book id', () => {
    const withCover = { ...valid, covers: { '1': { mimeType: 'image/jpeg', data: '/9j/4AAQ' } } };
    expect(parseBackup(JSON.stringify(withCover)).covers?.['1']?.mimeType).toBe('image/jpeg');
  });

  it('rejects malformed covers', () => {
    const notAnImage = { ...valid, covers: { '1': { mimeType: 'text/html', data: 'x' } } };
    expect(() => parseBackup(JSON.stringify(notAnImage))).toThrow(InvalidBackupError);
    const empty = { ...valid, covers: { '1': { mimeType: 'image/png', data: '' } } };
    expect(() => parseBackup(JSON.stringify(empty))).toThrow(InvalidBackupError);
  });

  it('rejects unknown versions and missing tables', () => {
    expect(() => parseBackup(JSON.stringify({ ...valid, version: 3 }))).toThrow(InvalidBackupError);
    const { books: _books, ...withoutBooks } = valid;
    expect(() => parseBackup(JSON.stringify(withoutBooks))).toThrow(InvalidBackupError);
  });

  it('rejects invalid records', () => {
    const badBook = { ...valid.books[0], readingStatus: 'SKIMMED' };
    expect(() => parseBackup(JSON.stringify({ ...valid, books: [badBook] }))).toThrow(
      InvalidBackupError,
    );
  });
});
