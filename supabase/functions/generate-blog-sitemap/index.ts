import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BlogPost {
  slug: string;
  updated_at: string;
  published_at: string;
  featured_image: string | null;
  title_ar: string;
}

interface BlogCategory {
  slug: string;
  updated_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📝 Generating blog sitemap...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const baseUrl = 'https://lamsetbeauty.com';
    const now = new Date().toISOString();

    // Fetch published blog posts
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at, featured_image, title_ar')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching blog posts:', postsError);
      throw postsError;
    }

    // Fetch active blog categories
    const { data: categories, error: categoriesError } = await supabase
      .from('blog_categories')
      .select('slug, updated_at')
      .eq('is_active', true)
      .order('display_order');

    if (categoriesError) {
      console.error('Error fetching blog categories:', categoriesError);
    }

    // Generate XML sitemap with image support
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Main Blog Page -->
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;

    // Add blog category pages
    if (categories && categories.length > 0) {
      for (const category of categories) {
        xmlContent += `  <url>
    <loc>${baseUrl}/blog?category=${category.slug}</loc>
    <lastmod>${new Date(category.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    }

    // Add individual blog posts with images
    if (posts && posts.length > 0) {
      for (const post of posts) {
        const lastmod = post.updated_at || post.published_at;
        
        xmlContent += `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>`;

        // Add image if available
        if (post.featured_image) {
          xmlContent += `
    <image:image>
      <image:loc>${post.featured_image}</image:loc>
      <image:title>${escapeXml(post.title_ar)}</image:title>
    </image:image>`;
        }

        xmlContent += `
  </url>
`;
      }
    }

    xmlContent += `</urlset>`;

    console.log(`✅ Generated blog sitemap with ${(posts?.length || 0) + (categories?.length || 0) + 1} URLs`);

    return new Response(xmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });

  } catch (error) {
    console.error('❌ Error generating blog sitemap:', error);
    
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

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
