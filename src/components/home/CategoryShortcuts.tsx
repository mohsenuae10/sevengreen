import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { OptimizedImage } from '@/components/OptimizedImage';
import { Skeleton } from '@/components/ui/skeleton';

export const CategoryShortcuts = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['category-shortcuts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name_ar, slug, banner_url')
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
    <section className="py-6 bg-gradient-to-b from-background to-muted/20 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 gap-4 md:gap-6 pb-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              className="group"
              aria-label={`عرض منتجات ${category.name_ar}`}
            >
              <div className="flex flex-col items-center gap-2 w-[100px] md:w-[120px]">
                {/* الدائرة */}
                <div className="relative w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-full bg-gradient-to-br from-primary-light/20 to-accent p-1.5 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20 cursor-pointer">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white shadow-soft">
                    <OptimizedImage
                      src={category.banner_url || ''}
                      alt={category.name_ar}
                      className="w-full h-full"
                      aspectRatio="1/1"
                    />
                  </div>
                </div>
                {/* اسم القسم */}
                <span className="text-sm md:text-base font-medium text-center text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                  {category.name_ar}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
