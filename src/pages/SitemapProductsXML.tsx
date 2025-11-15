import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SitemapProductsXML = () => {
  useEffect(() => {
    const fetchAndServeSitemap = async () => {
      try {
        // Invoke the edge function to generate product sitemap
        const { data, error } = await supabase.functions.invoke('generate-product-sitemap');
        
        if (error) throw error;
        
        // Set content type to XML and serve the sitemap
        const blob = new Blob([data], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        window.location.href = url;
      } catch (error) {
        console.error('Error fetching product sitemap:', error);
      }
    };
    
    fetchAndServeSitemap();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">جاري تحميل خريطة المنتجات...</h1>
        <p className="text-muted-foreground">يتم إعادة توجيهك إلى خريطة المنتجات</p>
      </div>
    </div>
  );
};

export default SitemapProductsXML;
