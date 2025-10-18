import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import defaultBanner from '@/assets/categories/hair-care-banner.jpg';

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
  bannerUrl?: string | null;
  categorySlug: string;
}

export const CategorySection = ({ title, category, products, icon, delay = '0s', bannerUrl, categorySlug }: CategorySectionProps) => {
  const categoryProducts = products.filter(p => p.category?.trim() === category);
  
  // Use provided banner URL or fallback to default
  const bannerImage = bannerUrl || defaultBanner;

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
      
      {/* Products Carousel */}
      <Carousel
        opts={{
          align: "start",
          loop: true,
          direction: "rtl",
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-mr-2 md:-mr-4">
          {categoryProducts.map((product) => (
            <CarouselItem key={product.id} className="pr-1 md:pr-2 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6 xl:basis-1/7">
              <ProductCard {...product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="left-auto -right-12" />
          <CarouselNext className="right-auto -left-12" />
        </div>
      </Carousel>
    </div>
  );
};
