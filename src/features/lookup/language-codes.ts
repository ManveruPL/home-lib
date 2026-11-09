// ISO 639-2/B codes used by ONIX and Open Library, mapped to the ISO 639-1 codes the app stores.
const LANGUAGE_CODES: Record<string, string> = {
  pol: 'pl',
  eng: 'en',
  ger: 'de',
  fre: 'fr',
  spa: 'es',
  ita: 'it',
  rus: 'ru',
  ukr: 'uk',
  cze: 'cs',
  slo: 'sk',
  lit: 'lt',
  lat: 'la',
};

/** "pol" -> "pl"; unknown codes are kept as they are. */
export function toLanguageCode(code: string | undefined): string | undefined {
  if (!code) return undefined;
  return LANGUAGE_CODES[code] ?? code;
}
