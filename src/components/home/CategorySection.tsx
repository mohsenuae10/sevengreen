import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import hairCareBanner from '@/assets/categories/hair-care-banner.jpg';
import skincareBanner from '@/assets/categories/skincare-banner.jpg';
import wellnessBanner from '@/assets/categories/wellness-banner.jpg';
import bodyCareBanner from '@/assets/categories/body-care-banner.jpg';
import menCareBanner from '@/assets/categories/men-care-banner.jpg';
import giftsBanner from '@/assets/categories/gifts-banner.jpg';

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

// Map category names to banner images
const categoryBanners: Record<string, string> = {
  'العناية بالشعر': hairCareBanner,
  'العناية بالبشرة': skincareBanner,
  'الصحة والعافية': wellnessBanner,
  'العناية بالجسم': bodyCareBanner,
  'العناية بالرجال': menCareBanner,
  'الهدايا والمجموعات': giftsBanner,
};

interface CategorySectionProps {
  title: string;
  category: string;
  products: Product[];
  icon?: React.ReactNode;
  delay?: string;
}

export const CategorySection = ({ title, category, products, icon, delay = '0s' }: CategorySectionProps) => {
  const categoryProducts = products.filter(p => p.category?.trim() === category).slice(0, 6);
  
  // Get banner image for this category (fallback to first image if not found)
  const bannerImage = categoryBanners[category] || hairCareBanner;

  // If no products for this category, don't show anything
  if (categoryProducts.length === 0) {
    return null;
  }

  return (
    <div className="animate-fade-in" style={{ animationDelay: delay }}>
      {/* Category Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-8 group">
        <div className="absolute inset-0">
          <img 
            src={bannerImage} 
            alt={`${title} - منتجات طبيعية`}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 p-8 md:p-12 flex items-center gap-4">
          {icon && (
            <div className="w-16 h-16 rounded-2xl bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/30">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-3xl md:text-4xl font-bold text-primary mb-2">{title}</h3>
            <p className="text-muted-foreground text-lg">اكتشف منتجات {title} الطبيعية</p>
          </div>
          
          <Button asChild variant="ghost" className="mr-auto group/btn">
            <Link to={`/products?category=${category}`}>
              <span>عرض الكل</span>
              <ChevronLeft className="h-4 w-4 mr-2 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Products Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 items-stretch">
        {categoryProducts.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
};
