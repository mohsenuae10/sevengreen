import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { OptimizedImage } from '@/components/OptimizedImage';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';
import { LocalizedLink } from '@/components/LocalizedLink';

export const CategoryShortcuts = () => {
  const { t, isRTL, getLocalizedField } = useLanguageCurrency();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['category-shortcuts'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('categories')
        .select('id, name_ar, name_en, slug, banner_url')
        .eq('is_active', true)
        .not('banner_url', 'is', null)
        .order('display_order');
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <section className="py-6 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 md:gap-6 pb-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-6 bg-white animate-fade-in border-b border-gray-50">
      <div className="container mx-auto px-4">
        <Carousel
          opts={{
            align: "start",
            loop: true,
            direction: isRTL ? "rtl" : "ltr",
          }}
          plugins={[
            Autoplay({
              delay: 3000,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-mr-2 md:-mr-4">
            {categories.map((category) => {
              const categoryName = getLocalizedField(category, 'name');
              return (
                <CarouselItem key={category.id} className="pr-2 md:pr-4 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6">
                  <LocalizedLink
                    to={`/products?category=${category.slug}`}
                    className="group"
                    aria-label={categoryName}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full bg-gradient-to-br from-secondary via-secondary to-primary/5 p-[3px] transition-all duration-300 group-hover:scale-105 group-hover:shadow-soft cursor-pointer">
                        <div className="w-full h-full rounded-full overflow-hidden bg-white">
                          <OptimizedImage
                            src={category.banner_url || ''}
                            alt={categoryName}
                            className="w-full h-full"
                            aspectRatio="1/1"
                          />
                        </div>
                      </div>
                      <span className="text-xs md:text-sm font-medium text-center text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                        {categoryName}
                      </span>
                    </div>
                  </LocalizedLink>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className={`${isRTL ? 'left-auto -right-12' : 'right-auto -left-12'} border-primary/20 text-primary hover:bg-primary hover:text-white`} />
            <CarouselNext className={`${isRTL ? 'right-auto -left-12' : 'left-auto -right-12'} border-primary/20 text-primary hover:bg-primary hover:text-white`} />
          </div>
        </Carousel>
      </div>
    </section>
  );
};
