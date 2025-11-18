import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SimpleProductCard } from '@/components/SimpleProductCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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

  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/30 min-h-[500px]" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 500px' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
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

        {isLoading || !products || products.length === 0 ? (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          </div>
        ) : (
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
            <CarouselContent className="-mr-2 md:-mr-3">
              {products.map((product) => (
                <CarouselItem key={product.id} className="pr-2 md:pr-3 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6">
                  <SimpleProductCard {...product} />
                </CarouselItem>
              ))}
            </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="left-auto -right-12" />
                <CarouselNext className="right-auto -left-12" />
              </div>
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
};
