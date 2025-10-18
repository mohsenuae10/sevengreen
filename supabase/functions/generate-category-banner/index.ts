import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { categoryName, categoryDescription } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Step 1: Analyze existing categories to extract visual identity
    const analysisPrompt = `Analyze the visual identity of a natural cosmetics store based on existing categories:
- العناية بالشعر (Hair Care)
- العناية بالبشرة (Skincare)
- الصحة والعافية (Wellness)
- العناية بالجسم (Body Care)
- العناية بالرجال (Men's Care)
- الهدايا والمجموعات (Gifts & Sets)

The store focuses on natural, organic products with a clean, wellness-focused aesthetic.
Describe the visual style, color palette, and key elements that should be present in category banners.`;

    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: analysisPrompt }
        ],
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('Analysis API error:', analysisResponse.status, errorText);
      throw new Error(`AI analysis failed: ${analysisResponse.status}`);
    }

    const analysisData = await analysisResponse.json();
    const visualIdentity = analysisData.choices[0].message.content;

    // Step 2: Generate intelligent prompt for image generation
    const imagePrompt = `Create a professional, clean banner image for a natural cosmetics store category.

Visual Identity Guidelines:
${visualIdentity}

New Category Details:
- Name: ${categoryName}
- Description: ${categoryDescription}

Requirements:
- Dimensions: 1920x640 pixels (landscape banner format)
- Style: Natural, organic, wellness-focused
- Color palette: Soft greens, whites, beige, natural earth tones
- Include subtle botanical elements (leaves, plants, natural textures)
- Professional photography style with natural lighting
- Clean, minimalist composition
- NO text, logos, or written content
- High quality, suitable for e-commerce
- Match the aesthetic of a premium natural cosmetics brand

The image should feel calming, natural, and premium while clearly representing the ${categoryName} category.`;

    // Step 3: Generate the image
    const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          { role: 'user', content: imagePrompt }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('Image generation API error:', imageResponse.status, errorText);
      throw new Error(`Image generation failed: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const generatedImageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      throw new Error('No image was generated');
    }

    // Step 4: Upload to Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Convert base64 to blob
    const base64Data = generatedImageUrl.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    const fileName = `${Date.now()}-${categoryName.replace(/\s+/g, '-').toLowerCase()}.png`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('category-banners')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('category-banners')
      .getPublicUrl(fileName);

    console.log('Banner generated successfully:', publicUrl);

    return new Response(
      JSON.stringify({ 
        bannerUrl: publicUrl,
        fileName: fileName
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in generate-category-banner:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});