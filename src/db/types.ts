import type { db } from './client';

/** The database or an open transaction; both run queries synchronously with .all()/.get()/.run(). */
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type DbExecutor = typeof db | Transaction;
