import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PromoBanner } from '@/components/home/PromoBanner';
import { PromotionalBanner } from '@/components/PromotionalBanner';
import { FeaturedProductsCarousel } from '@/components/home/FeaturedProductsCarousel';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';
import { SEOHead } from '@/components/SEO/SEOHead';
import { OrganizationSchema } from '@/components/SEO/OrganizationSchema';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper function to get icon component from icon name
const getIconComponent = (iconName: string) => {
  const IconComponent = (LucideIcons as any)[iconName];
  if (!IconComponent) return <LucideIcons.Sparkles className="h-6 w-6 text-primary" />;
  return <IconComponent className="h-6 w-6 text-primary" />;
};

export default function Home() {
  const queryClient = useQueryClient();
  
  // Clear old cache on mount
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['all-products'] });
    queryClient.invalidateQueries({ queryKey: ['active-categories'] });
  }, [queryClient]);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ['all-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  // Fetch active categories from database
  const { data: categories } = useQuery({
    queryKey: ['active-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch promotional banners
  const { data: activeBanners } = useQuery({
    queryKey: ['promotional-banners-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotional_banners')
        .select('id, banner_image_url, offer_description, product_id')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching promotional banners:', error);
        return [];
      }
      
      console.log('Promotional banners fetched:', data);
      return data || [];
    },
  });

  // Get featured product (most recent)
  const featuredProduct = products?.[0];

  // Filter categories that have products
  const displayCategories = categories?.filter(cat => 
    products?.some(p => p.category?.trim() === cat.slug)
  ) || [];

  return (
    <div className="min-h-screen">
      <SEOHead
        title="الرئيسية"
        description="سيفن جرين يقدّم منتجات طبيعية، وخاصة بار شامبو (شامبو صلب) يحتوي على مزيج من 12 عشبة طبيعية مثل الجينسنغ، أوراق التوت، زنجبيل وغيرها، لتغذية الشعر والعناية به بطريقة طبيعية 100%"
        keywords="شامبو طبيعي, صابون الشعر, منتجات طبيعية, عناية الشعر, سفن جرين, شامبو صلب, أعشاب طبيعية"
        type="website"
        url="/"
      />
      <OrganizationSchema />
      
      {/* Promotional Banners */}
      {activeBanners && activeBanners.length > 0 && (
        <div className="w-full">
          {activeBanners.map((banner) => (
            <PromotionalBanner
              key={banner.id}
              bannerUrl={banner.banner_image_url || ''}
              productId={banner.product_id}
              offerDescription={banner.offer_description}
            />
          ))}
        </div>
      )}

      {/* Promotional Banner */}
      <PromoBanner />
      
      {/* Products by Category */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">

          {error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">حدث خطأ في تحميل المنتجات</p>
              <Button onClick={() => window.location.reload()}>
                إعادة المحاولة
              </Button>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground mt-4">جاري التحميل...</p>
            </div>
          ) : products && products.length > 0 ? (
            <div className="space-y-20">
              {displayCategories.map((category, index) => (
                <CategorySection
                  key={category.id}
                  title={category.name_ar}
                  category={category.slug}
                  products={products}
                  icon={getIconComponent(category.icon)}
                  delay={`${index * 0.1}s`}
                  bannerUrl={category.banner_url}
                  categorySlug={category.slug}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد منتجات حالياً</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Carousel */}
      <FeaturedProductsCarousel />

      {/* Features Section */}
      <FeaturesSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
