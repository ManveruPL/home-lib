import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { db } from '@/db/client';
import { eq } from 'drizzle-orm';

import { authors, bookAuthors, bookGenres, books, genres } from '@/db/schema';
import { isbnVariants } from '@/lib/isbn';
import { normalizeForCompare } from '@/lib/text';

import {
  isCoverAvailable,
  readCoverForBackup,
  writeCoverFromBackup,
  type EmbeddedCover,
} from '../books/covers';

import { parseBackup } from './parse-backup';
import { BACKUP_VERSION, type BackupPayload, type RestoreSummary } from './types';

export { InvalidBackupError } from './parse-backup';

export async function createBackupPayload(): Promise<BackupPayload> {
  const [authorRows, genreRows, bookRows, bookAuthorRows, bookGenreRows] = await Promise.all([
    db.select().from(authors),
    db.select().from(genres),
    db.select().from(books),
    db.select().from(bookAuthors),
    db.select().from(bookGenres),
  ]);

  // Embeds locally stored covers (downloaded or photographed) so they survive a device move.
  // Read one at a time to keep memory use flat for large libraries.
  const covers: Record<string, EmbeddedCover> = {};
  for (const book of bookRows) {
    const cover = await readCoverForBackup(book.coverImage);
    if (cover) covers[String(book.id)] = cover;
  }

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    authors: authorRows,
    genres: genreRows,
    books: bookRows,
    book_authors: bookAuthorRows,
    book_genres: bookGenreRows,
    covers,
  };
}

/** Writes the backup to a temporary file and opens the Android share sheet. */
export async function shareBackup(dialogTitle: string): Promise<void> {
  const payload = await createBackupPayload();
  const date = payload.exportedAt.slice(0, 10);
  const file = new File(Paths.cache, `homelib-backup-${date}.json`);
  file.create({ overwrite: true });
  // Compact JSON: indentation adds nothing next to the base64 cover data.
  file.write(JSON.stringify(payload));

  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available');
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle });
}

/** Opens the document picker; returns null when the user cancels. */
export async function pickBackup(): Promise<BackupPayload | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', 'application/octet-stream'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets[0]) return null;
  const text = await new File(result.assets[0].uri).text();
  return parseBackup(text);
}

/**
 * Merges a backup into the library in one transaction. Authors and genres are matched by name;
 * books are skipped when their ISBN, or their title and catalog date, already exist.
 */
export function restoreBackup(payload: BackupPayload): RestoreSummary {
  const embeddedCovers = payload.covers ?? {};
  // New book id -> cover to write once the transaction has committed.
  const pendingCovers = new Map<number, EmbeddedCover>();

  const summary: RestoreSummary = {
    booksAdded: 0,
    booksSkipped: 0,
    authorsAdded: 0,
    genresAdded: 0,
    coversRestored: 0,
  };

  db.transaction((tx) => {
    const authorIds = new Map(
      tx
        .select()
        .from(authors)
        .all()
        .map((a) => [normalizeForCompare(a.name), a.id]),
    );
    const authorIdMap = new Map<number, number>();
    for (const author of payload.authors) {
      const key = normalizeForCompare(author.name);
      let id = authorIds.get(key);
      if (id === undefined) {
        const { id: _backupId, ...row } = author;
        id = tx.insert(authors).values(row).returning({ id: authors.id }).get().id;
        authorIds.set(key, id);
        summary.authorsAdded++;
      }
      authorIdMap.set(author.id, id);
    }

    const genreIds = new Map(
      tx
        .select()
        .from(genres)
        .all()
        .map((g) => [normalizeForCompare(g.name), g.id]),
    );
    const genreIdMap = new Map<number, number>();
    for (const genre of payload.genres) {
      const key = normalizeForCompare(genre.name);
      let id = genreIds.get(key);
      if (id === undefined) {
        id = tx.insert(genres).values({ name: genre.name }).returning({ id: genres.id }).get().id;
        genreIds.set(key, id);
        summary.genresAdded++;
      }
      genreIdMap.set(genre.id, id);
    }

    const existingBooks = tx.select().from(books).all();
    const existingIsbns = new Set(
      existingBooks.flatMap((b) => (b.isbn ? isbnVariants(b.isbn) : [])),
    );
    const existingKeys = new Set(existingBooks.map((b) => `${b.title}\n${b.dateCataloged}`));

    const bookIdMap = new Map<number, number>();
    for (const book of payload.books) {
      const isDuplicate = book.isbn
        ? isbnVariants(book.isbn).some((v) => existingIsbns.has(v))
        : existingKeys.has(`${book.title}\n${book.dateCataloged}`);
      if (isDuplicate) {
        summary.booksSkipped++;
        continue;
      }
      const { id: backupId, ...row } = book;
      const embedded = embeddedCovers[String(backupId)];
      // Local cover paths from another device are useless; use the embedded image (written
      // below) or keep the URI only if it still resolves (remote URL or same device).
      const coverImage = !embedded && isCoverAvailable(row.coverImage) ? row.coverImage : null;
      const id = tx
        .insert(books)
        .values({ ...row, coverImage })
        .returning({ id: books.id })
        .get().id;
      bookIdMap.set(backupId, id);
      if (embedded) pendingCovers.set(id, embedded);
      if (book.isbn) isbnVariants(book.isbn).forEach((v) => existingIsbns.add(v));
      summary.booksAdded++;
    }

    const authorLinks = payload.book_authors.flatMap(({ bookId, authorId }) => {
      const newBookId = bookIdMap.get(bookId);
      const newAuthorId = authorIdMap.get(authorId);
      return newBookId && newAuthorId ? [{ bookId: newBookId, authorId: newAuthorId }] : [];
    });
    if (authorLinks.length) tx.insert(bookAuthors).values(authorLinks).onConflictDoNothing().run();

    const genreLinks = payload.book_genres.flatMap(({ bookId, genreId }) => {
      const newBookId = bookIdMap.get(bookId);
      const newGenreId = genreIdMap.get(genreId);
      return newBookId && newGenreId ? [{ bookId: newBookId, genreId: newGenreId }] : [];
    });
    if (genreLinks.length) tx.insert(bookGenres).values(genreLinks).onConflictDoNothing().run();
  });

  // File writes cannot be rolled back, so they happen only after the data is committed.
  // A cover that fails to write just leaves that book without a cover.
  for (const [bookId, cover] of pendingCovers) {
    try {
      const uri = writeCoverFromBackup(cover);
      db.update(books).set({ coverImage: uri }).where(eq(books.id, bookId)).run();
      summary.coversRestored++;
    } catch (error) {
      console.warn('Could not restore cover', error);
    }
  }
  return summary;
}
