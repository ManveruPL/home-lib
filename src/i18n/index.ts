import { getLocales } from 'expo-localization';
import Storage from 'expo-sqlite/kv-store';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import pl from './locales/pl.json';

export const resources = {
  en: { translation: en },
  pl: { translation: pl },
} as const;

export const SUPPORTED_LANGUAGES = ['pl', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/** 'system' follows the device language. */
export type LanguagePreference = SupportedLanguage | 'system';

const LANGUAGE_KEY = 'language';

function isSupported(code: string | null | undefined): code is SupportedLanguage {
  return SUPPORTED_LANGUAGES.some((lang) => lang === code);
}

function systemLanguage(): SupportedLanguage {
  const code = getLocales()[0]?.languageCode;
  return isSupported(code) ? code : 'en';
}

export function getLanguagePreference(): LanguagePreference {
  const stored = Storage.getItemSync(LANGUAGE_KEY);
  return isSupported(stored) ? stored : 'system';
}

export async function setLanguagePreference(preference: LanguagePreference): Promise<void> {
  if (preference === 'system') {
    await Storage.removeItem(LANGUAGE_KEY);
  } else {
    await Storage.setItem(LANGUAGE_KEY, preference);
  }
  await i18n.changeLanguage(preference === 'system' ? systemLanguage() : preference);
}

const i18n = createInstance();

const preference = getLanguagePreference();

i18n.use(initReactI18next).init({
  resources,
  lng: preference === 'system' ? systemLanguage() : preference,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
