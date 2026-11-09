import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { authors, type Author } from '@/db/schema';
import type { DbExecutor } from '@/db/types';
import { compareText } from '@/lib/collator';
import { emptyToNull, normalizeForCompare } from '@/lib/text';

import { fetchOpenLibraryAuthor } from '../lookup/open-library';

import type { AuthorFormValues } from './author-form-schema';

export async function listAuthors(): Promise<Author[]> {
  const rows = await db.select().from(authors);
  return rows.sort((a, b) => compareText(a.name, b.name));
}

export async function getAuthor(id: number): Promise<Author | null> {
  const [row] = await db.select().from(authors).where(eq(authors.id, id));
  return row ?? null;
}

function toAuthorRow(values: AuthorFormValues) {
  return {
    name: values.name.trim(),
    biography: emptyToNull(values.biography),
    birthDate: emptyToNull(values.birthDate),
    deathDate: emptyToNull(values.deathDate),
  };
}

export function authorToFormValues(author: Author): AuthorFormValues {
  return {
    name: author.name,
    biography: author.biography ?? '',
    birthDate: author.birthDate ?? '',
    deathDate: author.deathDate ?? '',
  };
}

/** Creates an author, or returns the existing one with the same name. */
export function createAuthor(values: AuthorFormValues): Author {
  const existing = findAuthorByName(db, values.name);
  if (existing) return existing;
  return db.insert(authors).values(toAuthorRow(values)).returning().get();
}

export function updateAuthor(id: number, values: AuthorFormValues): void {
  db.update(authors).set(toAuthorRow(values)).where(eq(authors.id, id)).run();
}

export function deleteAuthor(id: number): void {
  db.delete(authors).where(eq(authors.id, id)).run();
}

/** Name match that ignores case, diacritics and punctuation. */
export function findAuthorByName(executor: DbExecutor, name: string): Author | undefined {
  const key = normalizeForCompare(name);
  return executor
    .select()
    .from(authors)
    .all()
    .find((a) => normalizeForCompare(a.name) === key);
}

/**
 * Fills in missing biography and life dates from Open Library. Best effort: runs after the book
 * is saved and silently gives up offline.
 */
export async function enrichAuthors(created: { id: number; openLibraryKey?: string }[]) {
  for (const { id, openLibraryKey } of created) {
    if (!openLibraryKey) continue;
    try {
      const details = await fetchOpenLibraryAuthor(openLibraryKey);
      const current = await getAuthor(id);
      if (!details || !current) continue;
      db.update(authors)
        .set({
          biography: current.biography ?? details.biography ?? null,
          birthDate: current.birthDate ?? details.birthDate ?? null,
          deathDate: current.deathDate ?? details.deathDate ?? null,
        })
        .where(eq(authors.id, id))
        .run();
    } catch (error) {
      console.warn('Author enrichment failed', error);
    }
  }
}
