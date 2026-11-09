/** ISO 639-1 codes offered in the language picker; labels live in i18n under `languages.*`. */
export const BOOK_LANGUAGES = [
  'pl',
  'en',
  'de',
  'fr',
  'es',
  'it',
  'ru',
  'uk',
  'cs',
  'sk',
  'lt',
  'la',
] as const;

export type BookLanguage = (typeof BOOK_LANGUAGES)[number];

export function isKnownLanguage(code: string): code is BookLanguage {
  return BOOK_LANGUAGES.some((lang) => lang === code);
}
