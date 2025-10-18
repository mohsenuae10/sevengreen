import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/ProductCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';

export const FeaturedProductsCarousel = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !products || products.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Star className="h-4 w-4 ml-2 fill-current" />
            منتجاتنا المميزة
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            الأكثر مبيعاً
          </h2>
          <p className="text-muted-foreground text-lg">
            اكتشف منتجاتنا الأكثر شعبية وتميزاً
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
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
              {products.map((product) => (
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
      </div>
    </section>
  );
};
