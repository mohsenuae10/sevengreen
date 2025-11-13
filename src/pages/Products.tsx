import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/ProductCard';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { ItemListSchema } from '@/components/SEO/ItemListSchema';
import { Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

  const canonicalUrl = selectedCategory 
    ? `https://sevengreenstore.com/products?category=${encodeURIComponent(selectedCategory)}`
    : 'https://sevengreenstore.com/products';

  return (
    <div className="container mx-auto px-4 py-8">
      <SEOHead
        title={selectedCategory ? `${selectedCategory} - منتجات سفن جرين` : 'جميع المنتجات - متجر سفن جرين'}
        description={selectedCategory ? `تصفح جميع منتجات ${selectedCategory} الطبيعية 100% من سفن جرين. أفضل منتجات العناية الطبيعية في السعودية مع توصيل سريع.` : 'تصفح جميع منتجات العناية الطبيعية من سفن جرين. بار شامبو طبيعي، سيروم فيتامين سي، ومنتجات عضوية 100% مع شحن مجاني داخل السعودية.'}
        keywords={selectedCategory ? `${selectedCategory}, منتجات طبيعية, سفن جرين, منتجات عضوية السعودية` : 'منتجات طبيعية, بار شامبو, سيروم فيتامين سي, العناية بالبشرة, العناية بالشعر, سفن جرين, منتجات عضوية السعودية'}
        type="website"
        url={canonicalUrl}
      />
      <BreadcrumbSchema
        items={[
          { name: 'الرئيسية', url: '/' },
          { name: 'المنتجات', url: '/products' },
          ...(selectedCategory ? [{ name: selectedCategory, url: `/products?category=${selectedCategory}` }] : []),
        ]}
      />
      {products && products.length > 0 && (
        <ItemListSchema
          products={products}
          listName={selectedCategory ? `منتجات ${selectedCategory}` : 'جميع منتجات سفن جرين'}
          category={selectedCategory || undefined}
        />
      )}
      <div className="mb-8 space-y-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">منتجاتنا</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            اكتشف مجموعتنا من المنتجات الطبيعية 100%
            {products && ` (${products.length} منتج)`}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
            className="rounded-full"
          >
            <span>الكل</span>
            {!selectedCategory && products && (
              <Badge variant="secondary" className="mr-2 text-xs">
                {products.length}
              </Badge>
            )}
          </Button>
          {categories?.map((category) => (
            <Button
              key={category.slug}
              variant={selectedCategory === category.slug ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.slug)}
              className="rounded-full"
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                <div className="h-8 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 items-stretch">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="mb-4">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">لا توجد منتجات</h3>
          <p className="text-muted-foreground mb-6">
            {selectedCategory
              ? `لم نجد منتجات في هذا القسم`
              : 'لا توجد منتجات متاحة حالياً'}
          </p>
          {selectedCategory && (
            <Button onClick={() => setSelectedCategory(null)}>
              عرض جميع المنتجات
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
