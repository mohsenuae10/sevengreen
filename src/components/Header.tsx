import { Link } from 'react-router-dom';
import { ShoppingCart, Leaf } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '@/contexts/CartContext';
import { Badge } from './ui/badge';

export const Header = () => {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-primary">Seven Green</span>
              <span className="text-xs text-accent">سفن جرين</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <Link to="/products" className="text-sm font-medium hover:text-primary transition-colors">
              المنتجات
            </Link>
          </nav>

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
