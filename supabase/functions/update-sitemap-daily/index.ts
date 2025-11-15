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
    console.log('🗺️ Starting daily sitemap update...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // استدعاء دالة توليد sitemap الرئيسي
    console.log('📄 Generating main sitemap...');
    const mainSitemapResponse = await supabase.functions.invoke('generate-sitemap');
    
    if (!mainSitemapResponse.data) {
      throw new Error('Failed to generate main sitemap');
    }

    console.log('✅ Main sitemap generated successfully');

    // استدعاء دالة توليد sitemap المنتجات
    console.log('📦 Generating products sitemap...');
    const productSitemapResponse = await supabase.functions.invoke('generate-product-sitemap');
    
    if (!productSitemapResponse.data) {
      throw new Error('Failed to generate products sitemap');
    }

    console.log('✅ Products sitemap generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sitemaps updated successfully',
        timestamp: new Date().toISOString(),
        results: {
          mainSitemap: mainSitemapResponse.data,
          productsSitemap: productSitemapResponse.data,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error updating sitemaps:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
