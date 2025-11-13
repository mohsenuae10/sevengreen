import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Arabic stop words to remove from slugs
const arabicStopWords = [
  'في', 'من', 'إلى', 'على', 'عن', 'مع', 'بـ', 'لـ', 'هو', 'هي',
  'هم', 'هن', 'أن', 'إن', 'كان', 'ليس', 'قد', 'لم', 'لن', 'ما',
  'لا', 'نعم', 'هذا', 'ذلك', 'هذه', 'تلك', 'هنا', 'هناك',
  'و', 'أو', 'لكن', 'ثم', 'إذا', 'بل', 'الذي', 'التي', 'اللذان',
];

function generateProductSlug(productName: string, category?: string): string {
  // Remove English characters and numbers
  let cleaned = productName.replace(/[a-zA-Z0-9]/g, ' ');
  
  // Remove special characters except Arabic and hyphens
  cleaned = cleaned.replace(/[^\u0600-\u06FF\s-]/g, ' ');
  
  // Split into words
  let words = cleaned
    .split(/\s+/)
    .filter(word => word.length > 1)
    .filter(word => !arabicStopWords.includes(word));
  
  // Take first 3-5 meaningful words
  const mainWords = words.slice(0, 5);
  
  // If we have category and less than 3 words, add category
  if (category && mainWords.length < 3) {
    const categoryWords = category
      .split(/\s+/)
      .filter(word => word.length > 1)
      .filter(word => !arabicStopWords.includes(word));
    
    mainWords.push(...categoryWords.slice(0, 1));
  }
  
  // Join with hyphens
  const slug = mainWords
    .join('-')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  return slug || 'منتج';
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Starting product slug update process...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name_ar, category, slug')
      .eq('is_active', true);

    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`);
    }

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No products found to update' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📦 Found ${products.length} products to process`);

    const updates: Array<{ id: string; oldSlug: string; newSlug: string }> = [];
    const redirects: Array<{ old_slug: string; new_slug: string; product_id: string }> = [];

    // Process each product
    for (const product of products) {
      const newSlug = generateProductSlug(product.name_ar, product.category);
      
      // Only update if slug changed
      if (product.slug !== newSlug) {
        updates.push({
          id: product.id,
          oldSlug: product.slug || '',
          newSlug: newSlug,
        });

        // Create redirect if old slug exists
        if (product.slug && product.slug.length > 0) {
          redirects.push({
            old_slug: product.slug,
            new_slug: newSlug,
            product_id: product.id,
          });
        }
      }
    }

    console.log(`🔄 Updating ${updates.length} product slugs...`);

    // Update products in batches
    const batchSize = 50;
    let updatedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      for (const update of batch) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ slug: update.newSlug })
          .eq('id', update.id);

        if (updateError) {
          console.error(`Error updating product ${update.id}:`, updateError);
          errorCount++;
        } else {
          updatedCount++;
        }
      }
    }

    console.log(`📝 Creating ${redirects.length} URL redirects...`);

    // Insert redirects
    let redirectsCreated = 0;
    if (redirects.length > 0) {
      const { error: redirectError } = await supabase
        .from('url_redirects')
        .upsert(redirects, { onConflict: 'old_slug' });

      if (redirectError) {
        console.error('Error creating redirects:', redirectError);
      } else {
        redirectsCreated = redirects.length;
      }
    }

    console.log('✅ Slug update completed');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Product slugs updated successfully',
        stats: {
          totalProducts: products.length,
          updatedProducts: updatedCount,
          failedUpdates: errorCount,
          redirectsCreated: redirectsCreated,
        },
        sample: updates.slice(0, 5).map(u => ({
          old: u.oldSlug,
          new: u.newSlug,
        })),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error updating slugs:', error);
    
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