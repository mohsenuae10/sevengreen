import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from './ProductCard';

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
  categoryAr?: string;
}

export const RelatedProducts = ({ currentProductId, category, categoryAr }: RelatedProductsProps) => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['related-products', category, currentProductId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name_ar, price, image_url, category, category_ar, slug, stock_quantity, is_active')
        .eq('category', category)
        .eq('is_active', true)
        .neq('id', currentProductId)
        .limit(12);

      if (error) throw error;

      // Strategic shuffle - prioritize variety
      const shuffled = data?.sort(() => 0.5 - Math.random()) || [];
      return shuffled.slice(0, 6);
    },
  });

  if (isLoading || !products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">منتجات ذات صلة</h2>
          {/* Strategic Internal Link to Category Page */}
          <Link 
            to={`/category/${category}`}
            className="text-primary hover:underline font-medium text-sm md:text-base"
          >
            عرض جميع منتجات {categoryAr || 'هذه الفئة'} ←
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 items-stretch">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} showCartButtonOnly />
          ))}
        </div>

        {/* Additional Internal Links for SEO */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            تبحثين عن المزيد؟ تصفحي{' '}
            <Link to="/products" className="text-primary hover:underline">
              جميع منتجاتنا
            </Link>
            {' '}أو اقرئي{' '}
            <Link to="/blog" className="text-primary hover:underline">
              مقالات العناية بالجمال
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};
