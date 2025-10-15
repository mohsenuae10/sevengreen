import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/ProductCard';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);
      
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const categories = ['صابون', 'شامبو', 'عناية'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6">منتجاتنا</h1>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
          >
            الكل
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {selectedCategory
              ? `لا توجد منتجات في فئة ${selectedCategory}`
              : 'لا توجد منتجات حالياً'}
          </p>
        </div>
      )}
    </div>
  );
}
