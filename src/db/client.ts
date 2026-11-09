import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

export const DATABASE_NAME = 'homelib.db';

// enableChangeListener powers useDbQuery (live queries).
export const expoDb = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });

// SQLite leaves foreign keys off by default; the junction tables rely on ON DELETE CASCADE.
expoDb.execSync('PRAGMA foreign_keys = ON;');

export const db = drizzle(expoDb, { schema });

export type Database = typeof db;
