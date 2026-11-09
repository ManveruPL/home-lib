import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// Covers are cached on disk so they load instantly without a connection.
const coversDir = new Directory(Paths.document, 'covers');

function isRemote(uri: string): boolean {
  return /^https?:\/\//i.test(uri);
}

function isInCoversDir(uri: string): boolean {
  return uri.startsWith(coversDir.uri);
}

function newCoverFile(uri: string): File {
  coversDir.create({ intermediates: true, idempotent: true });
  const extension = uri.match(/\.(jpe?g|png|webp|gif)(?:$|\?)/i)?.[1] ?? 'jpg';
  return new File(coversDir, `${Date.now()}-${Math.round(Math.random() * 1e6)}.${extension}`);
}

/**
 * Stores a cover in the app's document directory and returns its local URI:
 * - remote URLs (lookup results) are downloaded; on failure (e.g. offline) the URL is kept so
 *   the cover still shows once online;
 * - local files (camera or gallery picks, which live in the evictable cache) are copied.
 */
export async function cacheCover(uri: string | null): Promise<string | null> {
  if (!uri || isInCoversDir(uri)) return uri;
  try {
    const target = newCoverFile(uri);
    if (isRemote(uri)) {
      return (await File.downloadFileAsync(uri, target, { idempotent: true })).uri;
    }
    await new File(uri).copy(target);
    return target.uri;
  } catch (error) {
    console.warn('Could not cache cover', error);
    return uri;
  }
}

/** Deletes a cached cover file. Remote URLs and foreign files are left alone. */
export function deleteCachedCover(uri: string | null | undefined): void {
  if (!uri || !isInCoversDir(uri)) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (error) {
    console.warn('Could not delete cover', error);
  }
}

/** True if the URI can still be displayed: remote, or a local file that exists. */
export function isCoverAvailable(uri: string | null | undefined): boolean {
  if (!uri) return false;
  if (isRemote(uri)) return true;
  try {
    return new File(uri).exists;
  } catch {
    return false;
  }
}

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export type EmbeddedCover = { mimeType: string; data: string };

/** Reads a cached cover as base64 for the backup; null for remote or missing covers. */
export async function readCoverForBackup(uri: string | null): Promise<EmbeddedCover | null> {
  if (!uri || !isInCoversDir(uri)) return null;
  try {
    const file = new File(uri);
    if (!file.exists) return null;
    const extension = file.extension.replace('.', '').toLowerCase();
    return { mimeType: MIME_TYPES[extension] ?? 'image/jpeg', data: await file.base64() };
  } catch (error) {
    console.warn('Could not read cover for backup', error);
    return null;
  }
}

/** Writes a cover from a backup into the covers directory and returns its URI. */
export function writeCoverFromBackup(cover: EmbeddedCover): string {
  const target = newCoverFile(`cover.${EXTENSIONS[cover.mimeType] ?? 'jpg'}`);
  target.create();
  target.write(cover.data, { encoding: 'base64' });
  return target.uri;
}

// Covers are displayed at most ~160dp wide; 600px keeps them sharp and backups small.
const MAX_COVER_WIDTH = 600;

/**
 * Downscales a camera or gallery image to cover size. Phone photos are several MB, which would
 * bloat both storage and backups. Returns the original URI if resizing fails.
 */
export async function shrinkPickedCover(uri: string, width: number): Promise<string> {
  if (width <= MAX_COVER_WIDTH) return uri;
  try {
    const image = await ImageManipulator.manipulate(uri)
      .resize({ width: MAX_COVER_WIDTH })
      .renderAsync();
    const result = await image.saveAsync({ compress: 0.8, format: SaveFormat.JPEG });
    return result.uri;
  } catch (error) {
    console.warn('Could not shrink cover', error);
    return uri;
  }
}
