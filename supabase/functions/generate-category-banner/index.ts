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
    const analysisPrompt = `Analyze the visual identity of "لمسة بيوتي | Lamset Beauty" - a premium Arabic natural cosmetics store with a sophisticated modern aesthetic.

Brand Identity:
- Primary Color: Elegant Mauve (#B04D8C) - A sophisticated purple-pink tone
- Accent Color: Creamy Gold (#EAD5BA) - Warm, luxurious complement
- Secondary: Soft Mauve (#F5F0F3) - Delicate, feminine background
- Style: Modern elegance meets natural beauty
- Mood: Sophisticated, feminine, luxurious yet approachable

Visual Characteristics:
- Gradient effects from light to dark mauve tones
- Gold/cream accents for luxury touch
- Clean, minimalist compositions
- Natural botanical elements in mauve/purple tones (lavender, purple flowers)
- Soft lighting with a dreamy, elegant atmosphere
- Professional photography with a premium feel

Existing Categories:
- العناية بالشعر (Hair Care)
- العناية بالبشرة (Skincare)
- الصحة والعافية (Wellness)
- العناية بالجسم (Body Care)
- العناية بالرجال (Men's Care)
- الهدايا والمجموعات (Gifts & Sets)

Describe how to maintain visual consistency while representing the new category.`;

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
    const imagePrompt = `Create a professional, elegant banner image for "لمسة بيوتي | Lamset Beauty" - a premium natural cosmetics store.

Visual Identity Guidelines (MUST FOLLOW):
${visualIdentity}

New Category Details:
- Name: ${categoryName}
- Description: ${categoryDescription}

STRICT Design Requirements:
- Dimensions: 1920x640 pixels (landscape banner format)
- Primary Colors: Mauve/Purple tones (#B04D8C, #CC80B3, #7A3359)
- Accent Colors: Creamy Gold (#EAD5BA), Soft Mauve (#F5F0F3)
- Use gradient effects: light to dark mauve transitions
- Include elegant botanical elements in purple/mauve tones (lavender, purple flowers, soft petals)
- Lighting: Soft, dreamy, with a sophisticated atmosphere
- Style: Modern luxury meets natural elegance
- Composition: Clean, minimalist, premium aesthetic
- NO text, logos, or written content whatsoever
- High quality professional photography style
- Match the sophisticated, feminine luxury brand aesthetic

The image should evoke:
✨ Elegance and sophistication
💜 Feminine luxury in mauve tones
🌸 Natural beauty with purple/lavender botanicals
✨ Premium, high-end cosmetics brand

Background should feature mauve gradients with gold accents. Any natural elements (flowers, leaves) should be in complementary purple/lavender tones.`;

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
    
    // Create a safe filename using timestamp and random string (avoid Arabic characters)
    const fileName = `banner-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    
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