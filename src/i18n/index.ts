import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';

export const SUPPORTED_LANGUAGES = ['ar', 'en'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'ar';
export const DOMAIN = 'https://lamsetbeauty.com';

// Extract language from URL path
export function getLanguageFromPath(pathname: string): SupportedLanguage {
  const match = pathname.match(/^\/(ar|en)(\/|$)/);
  if (match && SUPPORTED_LANGUAGES.includes(match[1] as SupportedLanguage)) {
    return match[1] as SupportedLanguage;
  }
  return DEFAULT_LANGUAGE;
}

// Remove language prefix from path
export function stripLanguagePrefix(pathname: string): string {
  return pathname.replace(/^\/(ar|en)(\/|$)/, '/');
}

// Add language prefix to path
export function addLanguagePrefix(pathname: string, lang: SupportedLanguage): string {
  const stripped = stripLanguagePrefix(pathname);
  return `/${lang}${stripped === '/' ? '' : stripped}`;
}

// Get localized path
export function getLocalizedPath(path: string, lang?: SupportedLanguage): string {
  const language = lang || (i18n.language as SupportedLanguage) || DEFAULT_LANGUAGE;
  const cleanPath = stripLanguagePrefix(path);
  return addLanguagePrefix(cleanPath, language);
}

// Get alternate URL for hreflang
export function getAlternateUrl(pathname: string, lang: SupportedLanguage): string {
  const cleanPath = stripLanguagePrefix(pathname);
  return `${DOMAIN}/${lang}${cleanPath === '/' ? '' : cleanPath}`;
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
