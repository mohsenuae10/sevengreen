import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

export const LanguageCurrencyProvider = ({ children }: { children: ReactNode }) => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize language from URL
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return getLanguageFromPath(location.pathname);
  });

  // Initialize currency from localStorage
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
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

  // Sync language from URL changes
  useEffect(() => {
    const urlLang = getLanguageFromPath(location.pathname);
    if (urlLang !== language) {
      setLanguageState(urlLang);
    }
  }, [location.pathname]);

  // Save currency to localStorage
  useEffect(() => {
    localStorage.setItem('lamset-currency', currency);
  }, [currency]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) return;
    
    setLanguageState(lang);
    
    // Navigate to the same page but with the new language prefix
    const currentPathWithoutLang = stripLanguagePrefix(location.pathname);
    const newPath = addLanguagePrefix(currentPathWithoutLang, lang);
    navigate(newPath + location.search + location.hash, { replace: true });
  }, [location, navigate]);

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

  // Get localized field from a database record
  // e.g., getLocalizedField(product, 'name') returns product.name_ar or product.name_en
  const getLocalizedField = useCallback(<T extends Record<string, any>>(
    item: T,
    fieldBase: string,
    fallbackField?: string
  ): string => {
    const localizedKey = `${fieldBase}_${language}`;
    const fallbackKey = fallbackField || `${fieldBase}_ar`; // Always fallback to Arabic
    return (item[localizedKey] as string) || (item[fallbackKey] as string) || '';
  }, [language]);

  const getLocalizedPath = useCallback((path: string): string => {
    const cleanPath = stripLanguagePrefix(path);
    return addLanguagePrefix(cleanPath, language);
  }, [language]);

  const getAlternateLangPath = useCallback((path?: string): string => {
    const currentPath = path || location.pathname;
    const cleanPath = stripLanguagePrefix(currentPath);
    const alternateLang = language === 'ar' ? 'en' : 'ar';
    return addLanguagePrefix(cleanPath, alternateLang);
  }, [language, location.pathname]);

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

export const useLanguageCurrency = () => {
  const context = useContext(LanguageCurrencyContext);
  if (!context) {
    throw new Error('useLanguageCurrency must be used within LanguageCurrencyProvider');
  }
  return context;
};
