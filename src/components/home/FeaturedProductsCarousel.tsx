import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/ProductCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Sparkles } from 'lucide-react';

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
    <section className="py-16 bg-gradient-to-b from-secondary/40 via-secondary/20 to-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-10 right-20 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-20 w-48 h-48 bg-accent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/8 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-primary/15">
            <Sparkles className="h-4 w-4" />
            الأكثر مبيعاً
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            منتجاتنا المميزة
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            اكتشف أكثر المنتجات شعبية وتميزاً لدى عملائنا
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              direction: "rtl",
            }}
            className="w-full"
          >
            <CarouselContent className="-mr-2 md:-mr-3">
              {products.map((product) => (
                <CarouselItem key={product.id} className="pr-2 md:pr-3 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                  <ProductCard {...product} showCartButtonOnly />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="left-auto -right-12 border-primary/20 text-primary hover:bg-primary hover:text-white" />
              <CarouselNext className="right-auto -left-12 border-primary/20 text-primary hover:bg-primary hover:text-white" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};
