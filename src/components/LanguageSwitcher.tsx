import { Globe } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useLanguageCurrency, CURRENCIES, SupportedCurrency } from '@/contexts/LanguageCurrencyContext';
import { SupportedLanguage } from '@/i18n';

const LANGUAGE_OPTIONS: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
];

const CURRENCY_OPTIONS: { code: SupportedCurrency; label: string; symbol: string }[] = [
  { code: 'SAR', label: 'SAR', symbol: 'ر.س' },
  { code: 'USD', label: 'USD', symbol: '$' },
];

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguageCurrency();

  const currentLang = LANGUAGE_OPTIONS.find(l => l.code === language) || LANGUAGE_OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm font-medium h-9 px-2.5">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLang.flag} {currentLang.label}</span>
          <span className="sm:hidden">{currentLang.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {LANGUAGE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => setLanguage(option.code)}
            className={`cursor-pointer gap-2 ${language === option.code ? 'bg-accent font-bold' : ''}`}
          >
            <span>{option.flag}</span>
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const CurrencySwitcher = () => {
  const { currency, setCurrency, language } = useLanguageCurrency();

  const currentCurrency = CURRENCY_OPTIONS.find(c => c.code === currency) || CURRENCY_OPTIONS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 text-sm font-medium h-9 px-2.5">
          <span className="font-bold">{language === 'ar' ? currentCurrency.symbol : currentCurrency.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[130px]">
        {CURRENCY_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => setCurrency(option.code)}
            className={`cursor-pointer gap-2 ${currency === option.code ? 'bg-accent font-bold' : ''}`}
          >
            <span className="font-mono">{option.symbol}</span>
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
