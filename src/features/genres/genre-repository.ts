import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { genres, type Genre } from '@/db/schema';
import type { DbExecutor } from '@/db/types';
import { compareText } from '@/lib/collator';
import { normalizeForCompare } from '@/lib/text';

export async function listGenres(): Promise<Genre[]> {
  const rows = await db.select().from(genres);
  return rows.sort((a, b) => compareText(a.name, b.name));
}

export function findGenreByName(executor: DbExecutor, name: string): Genre | undefined {
  const key = normalizeForCompare(name);
  return executor
    .select()
    .from(genres)
    .all()
    .find((g) => normalizeForCompare(g.name) === key);
}

/** Returns the genre with this name, creating it if missing. */
export function findOrCreateGenre(executor: DbExecutor, name: string): Genre {
  const trimmed = name.trim();
  return (
    findGenreByName(executor, trimmed) ??
    executor.insert(genres).values({ name: trimmed }).returning().get()
  );
}

export function createGenre(name: string): Genre {
  return findOrCreateGenre(db, name);
}

export function deleteGenre(id: number): void {
  db.delete(genres).where(eq(genres.id, id)).run();
}
