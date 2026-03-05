import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import {
  SupportedLanguage,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  getLanguageFromPath,
  stripLanguagePrefix,
  addLanguagePrefix,
} from '@/i18n';

export type SupportedCurrency = 'SAR' | 'USD';

interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  symbolAr: string;
  rate: number; // Rate relative to SAR (base currency)
  locale: string;
  decimals: number;
}

export const CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  SAR: {
    code: 'SAR',
    symbol: 'SAR',
    symbolAr: 'ر.س',
    rate: 1,
    locale: 'ar-SA',
    decimals: 2,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    symbolAr: '$',
    rate: 0.2667, // 1 SAR ≈ 0.2667 USD
    locale: 'en-US',
    decimals: 2,
  },
};

interface LanguageCurrencyContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
  dir: 'rtl' | 'ltr';
  isRTL: boolean;
  t: (key: string, options?: Record<string, any>) => string;
  formatPrice: (priceInSAR: number) => string;
  formatPriceRaw: (priceInSAR: number) => { amount: string; symbol: string };
  convertPrice: (priceInSAR: number) => number;
  getLocalizedField: <T extends Record<string, any>>(
    item: T,
    fieldBase: string,
    fallbackField?: string
  ) => string;
  getLocalizedPath: (path: string) => string;
  getAlternateLangPath: (path?: string) => string;
  currencyConfig: CurrencyConfig;
}

const LanguageCurrencyContext = createContext<LanguageCurrencyContextType | undefined>(undefined);

/**
 * Next.js-compatible provider – uses next/router instead of react-router-dom.
 */
export const LanguageCurrencyProviderNext = ({ children }: { children: ReactNode }) => {
  const { i18n, t } = useTranslation();
  const router = useRouter();

  // Initialize language from URL
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
    return getLanguageFromPath(window.location.pathname);
  });

  // Initialize currency from localStorage
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
    if (typeof window === 'undefined') return 'SAR';
    const saved = localStorage.getItem('lamset-currency');
    if (saved && (saved === 'SAR' || saved === 'USD')) {
      return saved;
    }
    return 'SAR';
  });

  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = language === 'ar';
  const currencyConfig = CURRENCIES[currency];

  // Sync i18n language
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  // Update HTML attributes when language changes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.documentElement.setAttribute('data-lang', language);
  }, [language, dir]);

  // Sync language from URL changes (next/router)
  useEffect(() => {
    const urlLang = getLanguageFromPath(router.asPath);
    if (urlLang !== language) {
      setLanguageState(urlLang);
    }
  }, [router.asPath]);

  // Save currency to localStorage
  useEffect(() => {
    localStorage.setItem('lamset-currency', currency);
  }, [currency]);

  const pathname = typeof window !== 'undefined' ? window.location.pathname : router.asPath.split('?')[0];
  const search = typeof window !== 'undefined' ? window.location.search : '';
  const hash = typeof window !== 'undefined' ? window.location.hash : '';

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    
    setLanguageState(lang);
    
    const currentPathWithoutLang = stripLanguagePrefix(pathname);
    const newPath = addLanguagePrefix(currentPathWithoutLang, lang);
    router.replace(newPath + search + hash);
  }, [pathname, search, hash, router]);

  const setCurrency = useCallback((cur: SupportedCurrency) => {
    setCurrencyState(cur);
  }, []);

  const convertPrice = useCallback((priceInSAR: number): number => {
    return priceInSAR * currencyConfig.rate;
  }, [currencyConfig]);

  const formatPrice = useCallback((priceInSAR: number): string => {
    const converted = convertPrice(priceInSAR);
    const formatted = converted.toFixed(currencyConfig.decimals);
    
    if (language === 'ar') {
      return `${formatted} ${currencyConfig.symbolAr}`;
    }
    return `${currencyConfig.symbol}${formatted}`;
  }, [convertPrice, currencyConfig, language]);

  const formatPriceRaw = useCallback((priceInSAR: number): { amount: string; symbol: string } => {
    const converted = convertPrice(priceInSAR);
    return {
      amount: converted.toFixed(currencyConfig.decimals),
      symbol: language === 'ar' ? currencyConfig.symbolAr : currencyConfig.symbol,
    };
  }, [convertPrice, currencyConfig, language]);

  const getLocalizedField = useCallback(<T extends Record<string, any>>(
    item: T,
    fieldBase: string,
    fallbackField?: string
  ): string => {
    const localizedKey = `${fieldBase}_${language}`;
    const fallbackKey = fallbackField || `${fieldBase}_ar`;
    return (item[localizedKey] as string) || (item[fallbackKey] as string) || '';
  }, [language]);

  const getLocalizedPath = useCallback((path: string): string => {
    const cleanPath = stripLanguagePrefix(path);
    return addLanguagePrefix(cleanPath, language);
  }, [language]);

  const getAlternateLangPath = useCallback((path?: string): string => {
    const currentPath = path || pathname;
    const cleanPath = stripLanguagePrefix(currentPath);
    const alternateLang = language === 'ar' ? 'en' : 'ar';
    return addLanguagePrefix(cleanPath, alternateLang);
  }, [language, pathname]);

  return (
    <LanguageCurrencyContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        dir,
        isRTL,
        t,
        formatPrice,
        formatPriceRaw,
        convertPrice,
        getLocalizedField,
        getLocalizedPath,
        getAlternateLangPath,
        currencyConfig,
      }}
    >
      {children}
    </LanguageCurrencyContext.Provider>
  );
};

/** Legacy alias for backward compat */
export const LanguageCurrencyProvider = LanguageCurrencyProviderNext;

export const useLanguageCurrency = () => {
  const context = useContext(LanguageCurrencyContext);
  if (!context) {
    throw new Error('useLanguageCurrency must be used within LanguageCurrencyProvider');
  }
  return context;
};
