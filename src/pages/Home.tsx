import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HeroBanner } from '@/components/home/HeroBanner';
import { SpecialOffers } from '@/components/home/SpecialOffers';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { CTASection } from '@/components/home/CTASection';
import { Droplets, Sparkles, Wind, Flower2 } from 'lucide-react';

export default function Home() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['all-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Get featured product (most recent)
  const featuredProduct = products?.[0];

  // Get unique categories
  const categories = products ? [...new Set(products.map(p => p.category))] : [];

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <HeroBanner product={featuredProduct} />

      {/* Special Offers */}
      <SpecialOffers />

      {/* Features Section */}
      <FeaturesSection />

      {/* Products by Category */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              تصفح منتجاتنا
            </h2>
            <p className="text-muted-foreground text-lg">
              اختر من بين مجموعة واسعة من المنتجات الطبيعية
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground mt-4">جاري التحميل...</p>
            </div>
          ) : products && products.length > 0 ? (
            <div className="space-y-20">
              {categories.map((category, index) => {
                const icons = [
                  <Droplets className="h-6 w-6 text-primary" />,
                  <Sparkles className="h-6 w-6 text-primary" />,
                  <Wind className="h-6 w-6 text-primary" />,
                  <Flower2 className="h-6 w-6 text-primary" />,
                ];
                
                return (
                  <CategorySection
                    key={category}
                    title={category}
                    category={category}
                    products={products}
                    icon={icons[index % icons.length]}
                    delay={`${index * 0.1}s`}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد منتجات حالياً</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
