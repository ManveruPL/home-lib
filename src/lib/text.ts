// Combining diacritical marks left over after NFD decomposition.
const COMBINING_MARKS = /[\u0300-\u036f]/g;

/**
 * Lowercases and strips diacritics so "Łódź" matches "lodz". "ł" has no decomposition, so it is
 * mapped by hand.
 */
export function foldText(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(COMBINING_MARKS, '').replace(/ł/g, 'l');
}

/** foldText plus collapsing punctuation and whitespace, for loose name comparisons. */
export function normalizeForCompare(value: string): string {
  return foldText(value)
    .replace(/[\s.,;:!?'"„”«»()[\]\-–—/\\&+*]+/g, ' ')
    .trim();
}

/** Trims and turns empty strings into null, for optional database columns. */
export function emptyToNull(value: string | undefined | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
