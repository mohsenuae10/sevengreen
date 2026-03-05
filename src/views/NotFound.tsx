import { useLocation } from "@/hooks/useNextRouter";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEO/SEOHead";
import { BreadcrumbSchema } from "@/components/SEO/BreadcrumbSchema";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { Home, Search, Package } from "lucide-react";
import { useLanguageCurrency } from "@/contexts/LanguageCurrencyContext";
import { LocalizedLink } from "@/components/LocalizedLink";

const NotFound = () => {
  const location = useLocation();
  const { t, isRTL } = useLanguageCurrency();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const { data: popularProducts } = useQuery({
    queryKey: ['popular-products-404'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(4);

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <>
      <SEOHead
        title={t('notFound.seoTitle')}
        description={t('notFound.seoDesc')}
        noindex
      />
      <BreadcrumbSchema
        items={[
          { name: t('nav.home'), url: '/' },
          { name: t('notFound.title'), url: location.pathname },
        ]}
      />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          {/* Error Code */}
          <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
          
          {/* Error Message */}
          <h2 className="text-3xl font-bold mb-4">{t('notFound.title')}</h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t('notFound.notAvailable')}
          </p>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg">
              <LocalizedLink to="/">
                <Home className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('notFound.goHome')}
              </LocalizedLink>
            </Button>
            <Button asChild variant="outline" size="lg">
              <LocalizedLink to="/products">
                <Package className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('notFound.browseProducts')}
              </LocalizedLink>
            </Button>
          </div>

          {/* Quick Links */}
          <div className="bg-card p-6 rounded-lg shadow-md mb-12">
            <h3 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
              <Search className="h-5 w-5" />
              {t('notFound.quickLinks')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <LocalizedLink to="/about" className="text-primary hover:underline">{t('nav.about')}</LocalizedLink>
              <LocalizedLink to="/contact" className="text-primary hover:underline">{t('nav.contact')}</LocalizedLink>
              <LocalizedLink to="/faq" className="text-primary hover:underline">{t('nav.faq')}</LocalizedLink>
              <LocalizedLink to="/cart" className="text-primary hover:underline">{t('nav.cart')}</LocalizedLink>
            </div>
          </div>

          {/* Popular Products */}
          {popularProducts && popularProducts.length > 0 && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold mb-6">{t('notFound.suggestedProducts')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotFound;
