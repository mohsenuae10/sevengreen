import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating sitemap...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all active products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, updated_at')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    console.log(`Found ${products?.length || 0} active products`);

    const baseUrl = 'https://sevengreenstore.com';
    const currentDate = new Date().toISOString().split('T')[0];

    // Build sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Home page
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>1.0</priority>\n';
    sitemap += '  </url>\n';

    // Products listing page
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/products</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += '    <changefreq>daily</changefreq>\n';
    sitemap += '    <priority>0.9</priority>\n';
    sitemap += '  </url>\n';

    // Individual product pages
    if (products && products.length > 0) {
      for (const product of products) {
        const lastmod = product.updated_at 
          ? new Date(product.updated_at).toISOString().split('T')[0]
          : currentDate;
        
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/product/${product.id}</loc>\n`;
        sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
        sitemap += '    <changefreq>weekly</changefreq>\n';
        sitemap += '    <priority>0.8</priority>\n';
        sitemap += '  </url>\n';
      }
    }

    // Cart page
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/cart</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += '    <changefreq>weekly</changefreq>\n';
    sitemap += '    <priority>0.7</priority>\n';
    sitemap += '  </url>\n';

    // Checkout page
    sitemap += '  <url>\n';
    sitemap += `    <loc>${baseUrl}/checkout</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += '    <changefreq>weekly</changefreq>\n';
    sitemap += '    <priority>0.8</priority>\n';
    sitemap += '  </url>\n';

    sitemap += '</urlset>';

    console.log('Sitemap generated successfully');

    return new Response(sitemap, {
      headers: corsHeaders,
      status: 200,
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
