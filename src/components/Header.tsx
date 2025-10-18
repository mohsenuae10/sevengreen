import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Leaf, Menu } from 'lucide-react';
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

export const Header = () => {
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);

  // Fetch categories from database
  const { data: categories } = useQuery({
    queryKey: ['header-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('name_ar, slug')
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
              <SheetContent side="right" className="w-[300px] bg-background">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link 
                    to="/" 
                    onClick={handleMobileNavClick}
                    className="text-base font-medium hover:text-primary transition-colors py-2"
                  >
                    الرئيسية
                  </Link>
                  <div className="border-t pt-2">
                    <p className="text-sm font-semibold text-muted-foreground mb-2">الأقسام</p>
                    {categories?.map((category) => (
                      <Link
                        key={category.slug}
                        to={`/products?category=${category.slug}`}
                        onClick={handleMobileNavClick}
                        className="block text-sm hover:text-primary transition-colors py-2 pr-4"
                      >
                        {category.name_ar}
                      </Link>
                    ))}
                  </div>
                  <Link 
                    to="/products" 
                    onClick={handleMobileNavClick}
                    className="text-base font-medium hover:text-primary transition-colors py-2"
                  >
                    جميع المنتجات
                  </Link>
                  <Link 
                    to="/about" 
                    onClick={handleMobileNavClick}
                    className="text-base font-medium hover:text-primary transition-colors py-2"
                  >
                    من نحن
                  </Link>
                  <Link 
                    to="/contact" 
                    onClick={handleMobileNavClick}
                    className="text-base font-medium hover:text-primary transition-colors py-2"
                  >
                    اتصل بنا
                  </Link>
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
                  الأقسام
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background border shadow-lg">
                  <div className="grid gap-3 p-4 w-[400px]">
                    <div className="grid grid-cols-2 gap-2">
                      {categories?.map((category) => (
                        <Link
                          key={category.slug}
                          to={`/products?category=${category.slug}`}
                          onClick={handleDesktopCategoryClick}
                          className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-all hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground animate-fade-in"
                        >
                          <div className="text-sm font-medium leading-none">{category.name_ar}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/" className="inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50">
                  الرئيسية
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/products" className="inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50">
                  المنتجات
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/about" className="inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50">
                  من نحن
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/contact" className="inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50">
                  اتصل بنا
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Logo in Center */}
          <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">Seven Green</span>
              <span className="text-xs text-muted-foreground font-medium">سفن جرين</span>
            </div>
          </Link>

          {/* Cart */}
          <Link to="/cart">
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
          </Link>
        </div>
      </div>
    </header>
  );
};
