import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sparkles, Leaf, Heart } from 'lucide-react';

export default function Home() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(6);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-primary">
              Seven Green
            </h1>
            <p className="text-xl md:text-2xl text-accent font-medium">
              سفن جرين
            </p>
            <p className="text-lg text-muted-foreground">
              منتجات العناية الطبيعية - صوابين، شامبو، ومنتجات التجميل
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button asChild size="lg" className="text-lg">
                <Link to="/products">
                  تصفح المنتجات
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">طبيعي 100%</h3>
              <p className="text-muted-foreground">
                جميع منتجاتنا طبيعية وآمنة للاستخدام اليومي
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">جودة عالية</h3>
              <p className="text-muted-foreground">
                منتجات مختارة بعناية لضمان أفضل النتائج
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">عناية فائقة</h3>
              <p className="text-muted-foreground">
                نهتم براحتك ورضاك عن منتجاتنا
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              منتجاتنا المميزة
            </h2>
            <p className="text-muted-foreground">
              اكتشف أفضل منتجاتنا الطبيعية
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد منتجات حالياً</p>
            </div>
          )}

          <div className="text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/products">عرض جميع المنتجات</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
