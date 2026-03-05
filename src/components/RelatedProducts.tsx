import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from './ProductCard';
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';
import { LocalizedLink } from '@/components/LocalizedLink';

interface RelatedProductsProps {
  currentProductId: string;
  category: string;
  categoryAr?: string;
  categoryEn?: string;
}

export const RelatedProducts = ({ currentProductId, category, categoryAr, categoryEn }: RelatedProductsProps) => {
  const { t, language, isRTL } = useLanguageCurrency();

  const { data: products, isLoading } = useQuery({
    queryKey: ['related-products', category, currentProductId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('products')
        .select('id, name_ar, name_en, price, image_url, category, category_ar, slug, stock_quantity, is_active')
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

  const categoryName = language === 'en' ? (categoryEn || categoryAr || category) : (categoryAr || category);

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">{t('product.relatedProducts')}</h2>
          {/* Strategic Internal Link to Category Page */}
          <LocalizedLink 
            to={`/category/${category}`}
            className="text-primary hover:underline font-medium text-sm md:text-base"
          >
            {t('product.viewAllCategory', { category: categoryName })} {isRTL ? '←' : '→'}
          </LocalizedLink>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 items-stretch">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} showCartButtonOnly />
          ))}
        </div>

        {/* Additional Internal Links for SEO */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            {t('product.lookingForMore')}{' '}
            <LocalizedLink to="/products" className="text-primary hover:underline">
              {t('product.allOurProducts')}
            </LocalizedLink>
            {' '}{t('product.orRead')}{' '}
            <LocalizedLink to="/blog" className="text-primary hover:underline">
              {t('product.beautyArticles')}
            </LocalizedLink>
          </p>
        </div>
      </div>
    </section>
  );
};
