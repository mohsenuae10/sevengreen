import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PromoBanner } from '@/components/home/PromoBanner';
import { CategoryShortcuts } from '@/components/home/CategoryShortcuts';
import { PromotionalBanner } from '@/components/PromotionalBanner';
import { FeaturedProductsCarousel } from '@/components/home/FeaturedProductsCarousel';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';
import { SEOHead } from '@/components/SEO/SEOHead';
import { OrganizationSchema } from '@/components/SEO/OrganizationSchema';
import { LocalBusinessSchema } from '@/components/SEO/LocalBusinessSchema';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { FAQSchema } from '@/components/SEO/FAQSchema';
import { iconMap, DefaultIcon } from '@/utils/iconMap';
import { Button } from '@/components/ui/button';

// Helper function to get icon component from icon name
const getIconComponent = (iconName: string): JSX.Element => {
  const IconComponent = iconMap[iconName];
  if (!IconComponent) {
    return <DefaultIcon className="h-6 w-6 text-primary" />;
  }
  return <IconComponent className="h-6 w-6 text-primary" />;
};

export default function Home() {
  // Cache is managed by staleTime - no need to invalidate on every mount

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
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnMount: false,
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
        return [];
      }
      
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
        title="لمسة بيوتي - منتجات طبيعية للعناية بالشعر والبشرة"
        description="أفضل منتجات العناية الطبيعية في السعودية. بار شامبو، سيروم فيتامين سي، منتجات عضوية 100%. توصيل سريع لجميع مناطق المملكة."
        keywords="لمسة بيوتي, بار شامبو طبيعي, شامبو صلب, سيروم فيتامين سي, منتجات طبيعية السعودية, العناية بالشعر الطبيعي, العناية بالبشرة, منتجات عضوية, جينسنغ, أعشاب طبيعية, توصيل سريع السعودية, Lamset Beauty, شامبو بالأعشاب, منتجات بدون كيماويات"
        type="website"
        url="/"
      />
      <OrganizationSchema />
      <LocalBusinessSchema />
      
      <BreadcrumbSchema
        items={[
          { name: 'الرئيسية', url: '/' }
        ]}
      />
      
      <FAQSchema
        faqs={[
          {
            question: 'هل المنتجات أصلية ومضمونة؟',
            answer: 'نعم، جميع منتجاتنا أصلية 100% ومستوردة من مصادر موثوقة. نحن نضمن جودة وأصالة كل منتج نبيعه.'
          },
          {
            question: 'كم مدة التوصيل للطلبات؟',
            answer: 'مدة التوصيل من 2-5 أيام عمل لجميع مناطق المملكة العربية السعودية. نحن نقدم شحن سريع ومجاني للطلبات فوق 200 ريال.'
          },
          {
            question: 'ما هي طرق الدفع المتاحة؟',
            answer: 'نقبل الدفع عبر بطاقات الائتمان (Visa, Mastercard)، Apple Pay، Google Pay، والدفع عند الاستلام لبعض المناطق.'
          },
          {
            question: 'هل يمكن إرجاع المنتجات؟',
            answer: 'نعم، يمكنك إرجاع المنتجات خلال 14 يوم من تاريخ الاستلام إذا كانت بحالتها الأصلية ولم يتم فتحها. راجع سياسة الإرجاع للمزيد من التفاصيل.'
          },
          {
            question: 'هل المنتجات مناسبة لجميع أنواع البشرة والشعر؟',
            answer: 'منتجاتنا الطبيعية مصممة لتناسب معظم أنواع البشرة والشعر. ننصح بقراءة مكونات كل منتج والتأكد من عدم وجود حساسية تجاه أي مكون.'
          }
        ]}
      />
      
      {/* H1 - Critical for SEO */}
      <h1 className="sr-only">لمسة بيوتي - أفضل منتجات العناية الطبيعية بالشعر والبشرة في السعودية</h1>
      
      {/* Promotional Banner (Rotating Messages) */}
      <PromoBanner />

      {/* Category Shortcuts */}
      <CategoryShortcuts />

      {/* Promotional Banners (AI Generated/Uploaded) */}
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
      
      {/* Products by Category */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">

          {error ? (
            <div className="text-center py-12 min-h-[600px] flex items-center justify-center">
              <div>
                <p className="text-destructive mb-4">حدث خطأ في تحميل المنتجات</p>
                <Button onClick={() => window.location.reload()}>
                  إعادة المحاولة
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12 min-h-[600px] flex items-center justify-center">
              <div>
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="text-muted-foreground mt-4 text-sm">جاري التحميل...</p>
              </div>
            </div>
          ) : products && products.length > 0 ? (
            <div className="space-y-14">
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
                  isPriority={index === 0}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 min-h-[600px] flex items-center justify-center">
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
