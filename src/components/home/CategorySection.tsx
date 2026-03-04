import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
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
  isPriority?: boolean;
}

export const CategorySection = ({ title, category, products, icon, delay = '0s', bannerUrl, categorySlug, isPriority = false }: CategorySectionProps) => {
  const categoryProducts = products.filter(p => p.category?.trim() === category);
  
  // Use provided banner URL or fallback to default
  const bannerImage = bannerUrl || defaultBanner;

  // If no products for this category, don't show anything
  if (categoryProducts.length === 0) {
    return null;
  }

  return (
    <div className="animate-fade-in" style={{ animationDelay: delay }}>
      {/* Category Header - Elegant */}
      <div className="relative rounded-2xl overflow-hidden mb-6 group">
        <div className="absolute inset-0">
          <img 
            src={bannerImage} 
            alt={`${title} - منتجات طبيعية`}
            width="1200"
            height="200"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading={isPriority ? "eager" : "lazy"}
            fetchPriority={isPriority ? "high" : "auto"}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-primary-dark/90 via-primary/70 to-primary/40"></div>
        </div>
        
        <div className="relative z-10 py-8 px-6 md:py-10 md:px-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <div className="[&>svg]:text-white [&>svg]:h-5 [&>svg]:w-5">{icon}</div>
              </div>
            )}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white">{title}</h3>
              <p className="text-white/70 text-sm mt-0.5">اكتشف منتجات {title} الطبيعية</p>
            </div>
          </div>
          
          <Button asChild variant="ghost" className="text-white hover:bg-white/15 hover:text-white border border-white/20 rounded-xl px-4 group/btn">
            <Link to={`/products?category=${category}`}>
              <span className="text-sm font-medium">عرض الكل</span>
              <ArrowLeft className="h-4 w-4 mr-1.5 group-hover/btn:-translate-x-1 transition-transform" />
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
        className="w-full"
      >
        <CarouselContent className="-mr-2 md:-mr-3">
          {categoryProducts.map((product) => (
            <CarouselItem key={product.id} className="pr-2 md:pr-3 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
              <ProductCard {...product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="hidden md:block">
          <CarouselPrevious className="left-auto -right-12 border-primary/20 text-primary hover:bg-primary hover:text-white" />
          <CarouselNext className="right-auto -left-12 border-primary/20 text-primary hover:bg-primary hover:text-white" />
        </div>
      </Carousel>
    </div>
  );
};
