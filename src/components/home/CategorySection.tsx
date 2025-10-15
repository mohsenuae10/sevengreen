import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name_ar: string;
  description_ar: string;
  image_url: string;
  price: number;
  category: string;
  stock_quantity: number;
  is_active: boolean;
}

interface CategorySectionProps {
  title: string;
  category: string;
  products: Product[];
  icon?: React.ReactNode;
  delay?: string;
}

export const CategorySection = ({ title, category, products, icon, delay = '0s' }: CategorySectionProps) => {
  const categoryProducts = products.filter(p => p.category === category).slice(0, 4);
  
  if (categoryProducts.length === 0) return null;

  return (
    <div className="animate-fade-in" style={{ animationDelay: delay }}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-primary">{title}</h3>
            <p className="text-muted-foreground">اكتشف منتجات {title}</p>
          </div>
        </div>
        
        <Button asChild variant="ghost" className="group">
          <Link to={`/products?category=${category}`}>
            <span>عرض الكل</span>
            <ChevronLeft className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categoryProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};
