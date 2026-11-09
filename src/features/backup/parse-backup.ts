import { backupSchema, type BackupPayload } from './types';

/** Thrown when the picked file is not a valid HomeLib backup. */
export class InvalidBackupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidBackupError';
  }
}

export function parseBackup(text: string): BackupPayload {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new InvalidBackupError('Not a JSON file');
  }
  const result = backupSchema.safeParse(json);
  if (!result.success) {
    throw new InvalidBackupError(result.error.issues[0]?.message ?? 'Invalid backup');
  }
  return result.data;
}
