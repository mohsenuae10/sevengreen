import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SitemapPagesXML = () => {
  const [xmlContent, setXmlContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-pages-sitemap');
        
        if (error) {
          console.error('Error fetching pages sitemap:', error);
          setError('Failed to load sitemap');
          return;
        }

        if (typeof data === 'string') {
          setXmlContent(data);
        } else {
          setXmlContent(JSON.stringify(data));
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load sitemap');
      }
    };

    fetchSitemap();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!xmlContent) {
    return <div>Loading sitemap...</div>;
  }

  return (
    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
      {xmlContent}
    </pre>
  );
};

export default SitemapPagesXML;
