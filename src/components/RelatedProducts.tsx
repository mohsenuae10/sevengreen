import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SimpleProductCard } from './SimpleProductCard';

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
}

export const RelatedProducts = ({ currentProductId, category }: RelatedProductsProps) => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['related-products', category, currentProductId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name_ar, price, image_url, category, category_ar, slug, stock_quantity, is_active')
        .eq('category', category)
        .eq('is_active', true)
        .neq('id', currentProductId)
        .limit(8);

      if (error) throw error;

      // Shuffle and return 6 random products
      const shuffled = data?.sort(() => 0.5 - Math.random()) || [];
      return shuffled.slice(0, 6);
    },
  });

  if (isLoading || !products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            منتجات موصى بها
          </h2>
          <p className="text-muted-foreground">اكتشف منتجات مشابهة قد تعجبك</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {products.map((product) => (
            <SimpleProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};
