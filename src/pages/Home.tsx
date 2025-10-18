import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PromoBanner } from '@/components/home/PromoBanner';
import { FeaturedProductsCarousel } from '@/components/home/FeaturedProductsCarousel';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';
import { SEOHead } from '@/components/SEO/SEOHead';
import { OrganizationSchema } from '@/components/SEO/OrganizationSchema';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const queryClient = useQueryClient();
  
  // Clear old cache on mount
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['all-products'] });
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

  // جلب الأقسام من قاعدة البيانات
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Helper function to get icon component
  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-6 w-6 text-primary" /> : null;
  };

  // Filter categories that have products
  const displayCategories = categories?.filter(cat => 
    products?.some(p => p.category?.trim() === cat.name_ar)
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
                  category={category.name_ar}
                  categorySlug={category.slug}
                  bannerUrl={category.banner_url}
                  products={products}
                  icon={getIconComponent(category.icon)}
                  delay={`${index * 0.1}s`}
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
