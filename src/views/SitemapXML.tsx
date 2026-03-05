import { useEffect } from 'react';

const SitemapXML = () => {
  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const response = await fetch(
          'https://kcunskgjvmzrxenjblmk.supabase.co/functions/v1/generate-sitemap'
        );
        const xmlText = await response.text();
        
        // Create a blob and download it
        const blob = new Blob([xmlText], { type: 'application/xml' });
        const url = window.URL.createObjectURL(blob);
        window.location.href = url;
      } catch (error) {
        console.error('Error fetching sitemap:', error);
      }
    };

    fetchSitemap();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">جاري تحميل خريطة الموقع...</p>
    </div>
  );
};

export default SitemapXML;
