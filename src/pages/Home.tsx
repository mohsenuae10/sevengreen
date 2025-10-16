import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HeroBanner } from '@/components/home/HeroBanner';
import { FeaturedProductsCarousel } from '@/components/home/FeaturedProductsCarousel';
import { SpecialOffers } from '@/components/home/SpecialOffers';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';
import { SEOHead } from '@/components/SEO/SEOHead';
import { OrganizationSchema } from '@/components/SEO/OrganizationSchema';
import { Droplets, Sparkles, Wind, Flower2, UserCircle, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define priority categories and their icons
const PRIORITY_CATEGORIES = [
  'العناية بالشعر',
  'العناية بالبشرة',
  'العناية بالجسم',
  'الصحة والعافية',
  'العناية بالرجال',
  'الهدايا والمجموعات'
];

const categoryIcons: Record<string, React.ReactNode> = {
  'العناية بالشعر': <Droplets className="h-6 w-6 text-primary" />,
  'العناية بالبشرة': <Sparkles className="h-6 w-6 text-primary" />,
  'العناية بالجسم': <Wind className="h-6 w-6 text-primary" />,
  'الصحة والعافية': <Flower2 className="h-6 w-6 text-primary" />,
  'العناية بالرجال': <UserCircle className="h-6 w-6 text-primary" />,
  'الهدايا والمجموعات': <Gift className="h-6 w-6 text-primary" />,
};

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

  // Get featured product (most recent)
  const featuredProduct = products?.[0];

  // Filter available categories based on priority and products
  const availableCategories = PRIORITY_CATEGORIES.filter(cat => 
    products?.some(p => p.category?.trim() === cat)
  );
  
  // Show only available categories (not empty ones)
  const displayCategories = availableCategories;

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
      
      {/* Products by Category - في الأعلى */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              المنتجات المتوفرة
            </h2>
            <p className="text-muted-foreground text-lg">
              منتجات طبيعية 100% للعناية بالشعر والجسم
            </p>
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
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground mt-4">جاري التحميل...</p>
            </div>
          ) : products && products.length > 0 ? (
            <div className="space-y-20">
              {displayCategories.map((category, index) => (
                <CategorySection
                  key={category}
                  title={category}
                  category={category}
                  products={products}
                  icon={categoryIcons[category]}
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

      {/* Special Offers */}
      <SpecialOffers />

      {/* Features Section */}
      <FeaturesSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
