import { useState } from 'react';
import { ShoppingCart, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '@/contexts/CartContext';
import { Badge } from './ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import logo from '@/assets/logo.png';
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';
import { LanguageSwitcher, CurrencySwitcher } from './LanguageSwitcher';
import LocalizedLink from './LocalizedLink';

export const Header = () => {
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const { t, language, getLocalizedField } = useLanguageCurrency();

  // Fetch categories from database
  const { data: categories } = useQuery({
    queryKey: ['header-categories', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('name_ar, name_en, slug')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
  };

  const handleDesktopCategoryClick = () => {
    setDesktopMenuOpen(false);
  };

  const getCategoryName = (cat: any) => getLocalizedField(cat, 'name');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side={language === 'ar' ? 'right' : 'left'} className="w-[300px] bg-background">
                <nav className="flex flex-col gap-4 mt-8">
                  <LocalizedLink 
                    to="/" 
                    onClick={handleMobileNavClick}
                    className="text-base font-medium hover:text-primary transition-colors py-2"
                  >
                    {t('nav.home')}
                  </LocalizedLink>
                  <div className="border-t pt-2">
                    <p className="text-sm font-semibold text-muted-foreground mb-2">{t('nav.categories')}</p>
                    {categories?.map((category) => (
                      <LocalizedLink
                        key={category.slug}
                        to={`/products?category=${category.slug}`}
                        onClick={handleMobileNavClick}
                        className="block text-sm hover:text-primary transition-colors py-2 px-4"
                      >
                        {getCategoryName(category)}
                      </LocalizedLink>
                    ))}
                  </div>
                  <LocalizedLink 
                    to="/products" 
                    onClick={handleMobileNavClick}
                    className="text-base font-medium hover:text-primary transition-colors py-2"
                  >
                    {t('nav.allProducts')}
                  </LocalizedLink>
                  <LocalizedLink 
                    to="/about" 
                    onClick={handleMobileNavClick}
                    className="text-base font-medium hover:text-primary transition-colors py-2"
                  >
                    {t('nav.about')}
                  </LocalizedLink>
                  <LocalizedLink 
                    to="/contact" 
                    onClick={handleMobileNavClick}
                    className="text-base font-medium hover:text-primary transition-colors py-2"
                  >
                    {t('nav.contact')}
                  </LocalizedLink>
                  <LocalizedLink 
                    to="/blog" 
                    onClick={handleMobileNavClick}
                    className="text-base font-medium hover:text-primary transition-colors py-2"
                  >
                    {t('nav.blog')}
                  </LocalizedLink>
                  <div className="border-t pt-4 flex items-center gap-2">
                    <LanguageSwitcher />
                    <CurrencySwitcher />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Navigation Menu */}
          <NavigationMenu className="hidden md:flex" value={desktopMenuOpen ? "categories" : ""}>
            <NavigationMenuList>
              <NavigationMenuItem value="categories">
                <NavigationMenuTrigger 
                  className="bg-transparent"
                  onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
                >
                  {t('nav.categories')}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background border shadow-lg">
                  <div className="grid gap-3 p-4 w-[400px]">
                    <div className="grid grid-cols-2 gap-2">
                      {categories?.map((category) => (
                        <LocalizedLink
                          key={category.slug}
                          to={`/products?category=${category.slug}`}
                          onClick={handleDesktopCategoryClick}
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-all hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground animate-fade-in"
                        >
                          <div className="text-sm font-medium leading-none">{getCategoryName(category)}</div>
                        </LocalizedLink>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <LocalizedLink to="/" className="inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50">
                  {t('nav.home')}
                </LocalizedLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <LocalizedLink to="/products" className="inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50">
                  {t('nav.products')}
                </LocalizedLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <LocalizedLink to="/about" className="inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50">
                  {t('nav.about')}
                </LocalizedLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <LocalizedLink to="/contact" className="inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50">
                  {t('nav.contact')}
                </LocalizedLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <LocalizedLink to="/blog" className="inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50">
                  {t('nav.blog')}
                </LocalizedLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Logo in Center */}
          <LocalizedLink to="/" className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
            <img src={logo} alt="لمسة بيوتي | Lamset Beauty" className="h-16 w-16 object-contain" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">
                {language === 'ar' ? 'لمسة بيوتي' : 'Lamset Beauty'}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {language === 'ar' ? 'Lamset Beauty' : 'لمسة بيوتي'}
              </span>
            </div>
          </LocalizedLink>

          {/* Right side: Language/Currency Switchers + Cart */}
          <div className="flex items-center gap-1">
            <div className="hidden md:flex items-center gap-0.5">
              <LanguageSwitcher />
              <CurrencySwitcher />
            </div>
            <LocalizedLink to="/cart">
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-accent text-accent-foreground"
                    variant="default"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </LocalizedLink>
          </div>
        </div>
      </div>
    </header>
  );
};
