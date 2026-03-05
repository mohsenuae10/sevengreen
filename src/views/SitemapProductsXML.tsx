import { useEffect, useState } from 'react';

const SitemapProductsXML = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndServeSitemap = async () => {
      try {
        const response = await fetch(
          'https://kcunskgjvmzrxenjblmk.supabase.co/functions/v1/generate-product-sitemap'
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const xmlText = await response.text();
        
        // Replace the entire document with XML content
        document.open('text/xml');
        document.write(xmlText);
        document.close();
      } catch (err: any) {
        console.error('Error fetching product sitemap:', err);
        setError(err.message || 'فشل في تحميل خريطة المنتجات');
        setLoading(false);
      }
    };

    fetchAndServeSitemap();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">خطأ: {error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">جاري تحميل خريطة المنتجات...</p>
      </div>
    );
  }

  return null;
};

export default SitemapProductsXML;