import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching active products for sitemap...');

    // Fetch all active products with their images
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        slug,
        name_ar,
        updated_at,
        price,
        image_url,
        product_images (
          image_url,
          is_primary
        )
      `)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    console.log(`Found ${products?.length || 0} active products`);

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

    products?.forEach((product) => {
      const productUrl = `https://sevengreenstore.com/product/${product.slug || product.id}`;
      // Use full ISO timestamp for better precision
      const lastmod = new Date(product.updated_at).toISOString();
      
      // Calculate priority based on price (higher price = higher priority, max 0.9)
      const priority = Math.min(0.9, 0.6 + (product.price / 500) * 0.3).toFixed(1);

      sitemap += `
  <url>
    <loc>${productUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>`;

      // Add product images to sitemap
      if (product.image_url) {
        sitemap += `
    <image:image>
      <image:loc>${product.image_url}</image:loc>
      <image:title>${product.name_ar}</image:title>
      <image:caption>منتج ${product.name_ar} من سفن جرين</image:caption>
    </image:image>`;
      }

      // Add additional images
      if (product.product_images && product.product_images.length > 0) {
        product.product_images.forEach((img: any) => {
          if (img.image_url && img.image_url !== product.image_url) {
            sitemap += `
    <image:image>
      <image:loc>${img.image_url}</image:loc>
      <image:title>${product.name_ar}</image:title>
      <image:caption>منتج ${product.name_ar} من سفن جرين</image:caption>
    </image:image>`;
          }
        });
      }

      sitemap += `
  </url>`;
    });

    sitemap += `
</urlset>`;

    console.log('Product sitemap generated successfully');

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating product sitemap:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});