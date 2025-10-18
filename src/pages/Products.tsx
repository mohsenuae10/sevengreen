import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/ProductCard';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);
      
      if (selectedCategory) {
        query = query.eq('category', selectedCategory.trim());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  // Fetch categories from database
  const { data: categories } = useQuery({
    queryKey: ['products-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('name_ar, slug')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data || [];
    },
  });

  const seoTitle = selectedCategory 
    ? `منتجات ${selectedCategory}` 
    : 'جميع المنتجات';
  
  const seoDescription = selectedCategory
    ? `تصفح مجموعة ${selectedCategory} من سفن جرين - منتجات طبيعية 100% للعناية بالشعر والجسم`
    : 'تصفح جميع منتجات سفن جرين الطبيعية - شامبو صلب، صابون، ومنتجات العناية الطبيعية';

  return (
    <div className="container mx-auto px-4 py-8">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords="منتجات طبيعية, شامبو صلب, صابون طبيعي, عناية الشعر, سفن جرين"
        type="website"
        url="/products"
      />
      <BreadcrumbSchema
        items={[
          { name: 'الرئيسية', url: '/' },
          { name: 'المنتجات', url: '/products' },
        ]}
      />
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-6">منتجاتنا</h1>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
          >
            الكل
          </Button>
          {categories?.map((category) => (
            <Button
              key={category.slug}
              variant={selectedCategory === category.slug ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.slug)}
            >
              {category.name_ar}
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">حدث خطأ في تحميل المنتجات</p>
          <Button onClick={() => window.location.reload()}>
            إعادة المحاولة
          </Button>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 items-stretch">
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
