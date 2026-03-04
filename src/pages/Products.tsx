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
import { getCareType } from '@/utils/categoryHelpers';
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function Products() {
  const { t, language, getLocalizedField, getLocalizedPath } = useLanguageCurrency();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

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
      
      // جلب التقييمات لكل منتج
      const productsWithRatings = await Promise.all(
        (data || []).map(async (product) => {
          const { data: ratingData } = await supabase
            .rpc('get_product_rating', { product_uuid: product.id });
          
          return {
            ...product,
            aggregateRating: ratingData?.[0]?.review_count > 0 ? {
              ratingValue: Number(ratingData[0].average_rating),
              reviewCount: ratingData[0].review_count,
            } : undefined,
          };
        })
      );
      
      return productsWithRatings;
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
        .select('name_ar, name_en, slug')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data || [];
    },
  });

  const seoTitle = selectedCategoryName 
    ? t('products.categorySeo', { category: selectedCategoryName })
    : t('products.allProductsSeo');
  
  const seoDescription = selectedCategoryName
    ? t('products.categoryDesc', { category: selectedCategoryName })
    : t('products.allProductsDesc');

  const canonicalUrl = selectedCategory 
    ? `https://lamsetbeauty.com/${language}/products?category=${encodeURIComponent(selectedCategory)}`
    : `https://lamsetbeauty.com/${language}/products`;

  return (
    <main className="container mx-auto px-4 py-8" itemScope itemType="https://schema.org/CollectionPage">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={selectedCategoryName ? `${selectedCategoryName}, ${t('common.naturalProducts')}, ${t('common.brand')}` : `${t('common.naturalProducts')}, ${t('common.brand')}`}
        type="website"
        url={canonicalUrl}
      />
      <BreadcrumbSchema
        items={[
          { name: t('nav.home'), url: getLocalizedPath('/') },
          { name: t('nav.products'), url: getLocalizedPath('/products') },
          ...(selectedCategoryName ? [{ name: selectedCategoryName, url: getLocalizedPath(`/products?category=${selectedCategory}`) }] : []),
        ]}
      />
      {products && products.length > 0 && (
        <ItemListSchema
          products={products}
          listName={selectedCategoryName ? t('products.categoryProducts', { category: selectedCategoryName }) : t('products.allProducts')}
          category={selectedCategoryName || undefined}
        />
      )}
      
      {/* Visible Breadcrumbs for UX + SEO */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={getLocalizedPath('/')}>{t('nav.home')}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {selectedCategoryName ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href={getLocalizedPath('/products')}>{t('nav.products')}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{selectedCategoryName}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage>{t('nav.products')}</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 space-y-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2" itemProp="name">
            {selectedCategoryName ? t('products.categoryProducts', { category: selectedCategoryName }) : t('products.allProducts')}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base" itemProp="description">
            {selectedCategoryName 
              ? t('products.categoryDesc', { category: selectedCategoryName })
              : t('products.allProductsDesc')}
            {products && ` (${t('products.productCount', { count: products.length })})`}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => {
              setSelectedCategory(null);
              setSelectedCategoryName(null);
            }}
            className="rounded-full"
          >
            <span>{t('common.all')}</span>
            {!selectedCategory && products && (
              <Badge variant="secondary" className="ms-2 text-xs">
                {products.length}
              </Badge>
            )}
          </Button>
          {categories?.map((category) => (
            <Button
              key={category.slug}
              variant={selectedCategory === category.slug ? 'default' : 'outline'}
              onClick={() => {
                setSelectedCategory(category.slug);
                setSelectedCategoryName(getLocalizedField(category, 'name'));
              }}
              className="rounded-full"
            >
              {getLocalizedField(category, 'name')}
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{t('products.errorLoading')}</p>
          <Button onClick={() => window.location.reload()}>
            {t('products.retry')}
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
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 items-stretch" itemScope itemType="https://schema.org/ItemList">
            {products.map((product, index) => (
              <div key={product.id} itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <meta itemProp="position" content={String(index + 1)} />
                <ProductCard {...product} />
              </div>
            ))}
          </div>
          
          {/* SEO Content Section */}
          {selectedCategoryName && (
            <section className="mt-12 prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-primary mb-4">{t('products.aboutCategory', { category: selectedCategoryName })}</h2>
              <div className="text-muted-foreground leading-relaxed">
                <p>
                  {t('products.aboutCategoryDesc', { category: selectedCategoryName, careType: getCareType(selectedCategory || '') })}
                </p>
                <p className="mt-4">
                  <strong>{t('products.whyChooseCategory', { category: selectedCategoryName })}</strong>
                </p>
                <ul className="list-disc list-inside mt-2 space-y-2">
                  <li>{t('products.benefit1')}</li>
                  <li>{t('products.benefit2')}</li>
                  <li>{t('products.benefit3')}</li>
                  <li>{t('products.benefit4')}</li>
                  <li>{t('products.benefit5')}</li>
                </ul>
                <p className="mt-4">
                  {t('products.orderNow')}
                </p>
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <div className="mb-4">
            <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('products.noProducts')}</h3>
          <p className="text-muted-foreground mb-6">
            {selectedCategory
              ? t('products.noProductsInCategory')
              : t('products.noProductsAvailable')}
          </p>
          {selectedCategory && (
            <Button onClick={() => setSelectedCategory(null)}>
              {t('products.showAllProducts')}
            </Button>
          )}
        </div>
      )}
    </main>
  );
}
