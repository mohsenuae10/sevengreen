import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageProcessingResult {
  productId: string;
  productName: string;
  oldUrl: string;
  newUrl?: string;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🖼️ Starting image migration process...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all products with external images
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name_ar, image_url')
      .eq('is_active', true)
      .not('image_url', 'is', null);

    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`);
    }

    console.log(`📦 Found ${products?.length || 0} products to process`);

    const results: ImageProcessingResult[] = [];
    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const product of products || []) {
      const result: ImageProcessingResult = {
        productId: product.id,
        productName: product.name_ar,
        oldUrl: product.image_url,
        status: 'skipped',
      };

      try {
        // Skip if already using Supabase Storage
        if (product.image_url?.includes('supabase.co/storage')) {
          console.log(`⏭️ Skipping ${product.name_ar} - already in Supabase Storage`);
          result.status = 'skipped';
          skippedCount++;
          results.push(result);
          continue;
        }

        console.log(`🔄 Processing: ${product.name_ar}`);
        console.log(`   Old URL: ${product.image_url}`);

        // Fetch the external image
        const imageResponse = await fetch(product.image_url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }

        // Get image data
        const imageBlob = await imageResponse.blob();
        const imageBuffer = await imageBlob.arrayBuffer();
        
        // Generate filename
        const fileExt = product.image_url.split('.').pop()?.split('?')[0] || 'jpg';
        const fileName = `${product.id}-${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        console.log(`   Uploading to: ${filePath}`);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageBuffer, {
            contentType: imageBlob.type || 'image/jpeg',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        console.log(`   New URL: ${publicUrl}`);

        // Update product with new image URL
        const { error: updateError } = await supabase
          .from('products')
          .update({ image_url: publicUrl })
          .eq('id', product.id);

        if (updateError) {
          throw new Error(`Failed to update product: ${updateError.message}`);
        }

        result.newUrl = publicUrl;
        result.status = 'success';
        successCount++;
        console.log(`✅ Success: ${product.name_ar}`);

      } catch (error) {
        console.error(`❌ Failed to process ${product.name_ar}:`, error);
        result.status = 'failed';
        result.error = error instanceof Error ? error.message : 'Unknown error';
        failedCount++;
      }

      results.push(result);
    }

    console.log('✅ Migration completed');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Image migration completed',
        stats: {
          total: products?.length || 0,
          success: successCount,
          failed: failedCount,
          skipped: skippedCount,
        },
        results: results.slice(0, 10), // Return first 10 results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error in migration:', error);
    
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
