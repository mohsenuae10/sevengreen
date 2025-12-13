import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🗺️ Generating dynamic pages sitemap...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch public settings for domain
    const { data: settings } = await supabase
      .from('public_settings')
      .select('store_url')
      .single();

    const baseUrl = settings?.store_url || 'https://lamsetbeauty.com';
    const now = new Date().toISOString();

    // Static pages with dynamic lastmod
    const staticPages: SitemapUrl[] = [
      {
        loc: `${baseUrl}/`,
        lastmod: now,
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        loc: `${baseUrl}/products`,
        lastmod: now,
        changefreq: 'daily',
        priority: '0.9'
      },
      {
        loc: `${baseUrl}/blog`,
        lastmod: now,
        changefreq: 'daily',
        priority: '0.8'
      },
      {
        loc: `${baseUrl}/about`,
        lastmod: now,
        changefreq: 'monthly',
        priority: '0.7'
      },
      {
        loc: `${baseUrl}/contact`,
        lastmod: now,
        changefreq: 'monthly',
        priority: '0.7'
      },
      {
        loc: `${baseUrl}/faq`,
        lastmod: now,
        changefreq: 'monthly',
        priority: '0.6'
      },
      {
        loc: `${baseUrl}/shipping-policy`,
        lastmod: now,
        changefreq: 'yearly',
        priority: '0.5'
      },
      {
        loc: `${baseUrl}/return-policy`,
        lastmod: now,
        changefreq: 'yearly',
        priority: '0.5'
      },
      {
        loc: `${baseUrl}/privacy-policy`,
        lastmod: now,
        changefreq: 'yearly',
        priority: '0.5'
      },
      {
        loc: `${baseUrl}/terms-of-service`,
        lastmod: now,
        changefreq: 'yearly',
        priority: '0.5'
      },
    ];

    // Fetch active categories for dedicated category pages
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('slug, updated_at, name_ar')
      .eq('is_active', true)
      .order('display_order');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    }

    // Add dedicated category landing pages
    const categoryUrls: SitemapUrl[] = (categories || []).map(cat => ({
      loc: `${baseUrl}/category/${cat.slug}`,
      lastmod: new Date(cat.updated_at).toISOString(),
      changefreq: 'weekly',
      priority: '0.85'
    }));

    // Combine all URLs
    const allUrls = [...staticPages, ...categoryUrls];

    // Generate XML sitemap
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    console.log(`✅ Generated pages sitemap with ${allUrls.length} URLs`);

    return new Response(xmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });

  } catch (error) {
    console.error('❌ Error generating pages sitemap:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
