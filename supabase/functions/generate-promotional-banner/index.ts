import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bannerDescription, productInfo } = await req.json();

    console.log('Generating promotional banner:', { bannerDescription, productInfo });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build the prompt based on user's detailed description
    let prompt = `Create a professional, eye-catching promotional banner IMAGE ONLY (NO TEXT) for "لمسة بيوتي | Lamset Beauty" - a premium Arabic natural cosmetics e-commerce store.

BRAND IDENTITY (STRICTLY FOLLOW):
- Primary Color: Elegant Mauve #B04D8C (sophisticated purple-pink)
- Accent Color: Creamy Gold #EAD5BA (warm luxury)
- Secondary: Soft Mauve #F5F0F3 (delicate background)
- Brand Style: Modern elegance meets natural beauty
- Mood: Sophisticated, feminine, luxurious

Banner Description (follow this exactly): ${bannerDescription}

STRICT Design Requirements:
- Dimensions: 1536x512 pixels (WIDE banner format - landscape orientation)
- The banner MUST be exactly 1536 pixels wide and 512 pixels tall
- Color Palette: 
  * Primary: Mauve tones (#B04D8C, #CC80B3, #7A3359)
  * Accent: Creamy gold (#EAD5BA)
  * Background: Soft mauve gradients (#F5F0F3 to #EDE5EA)
- Use gradient effects: light to dark mauve transitions
- NO text, words, numbers, or letters in the image
- NO TEXT AT ALL - only visual elements, colors, and graphics
- Leave strategic space for text overlay (usually center or left/right thirds)
- Professional, elegant, luxury design
- High contrast between elements for visual impact
- Include subtle botanical elements in purple/lavender tones if relevant
- Modern, sophisticated aesthetic matching a premium cosmetics brand
- Ultra high resolution with sharp details`;

    if (productInfo) {
      prompt += `\n\nProduct to Feature: ${productInfo.name}
  
Product Integration:
- Integrate product naturally into the mauve/gold color scheme
- Maintain elegant, sophisticated presentation
- Ensure product stands out against mauve gradient background
- Use gold accents to highlight premium quality`;
    }

    prompt += `\n\nCRITICAL REQUIREMENTS:
- Follow the user's description precisely while maintaining brand colors
- Aspect ratio: WIDE banner (1536x512) - horizontal format only
- DO NOT add any text, numbers, Arabic/English letters, or symbols
- Background should feature mauve gradients with gold/cream accents
- The image should be a clean, elegant design ready for text overlay
- Make it visually stunning, luxurious, and professionally sophisticated
- Any natural elements (flowers, plants) MUST be in purple/lavender/mauve tones to match brand identity`;

    console.log('AI Prompt:', prompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image generated from AI');
    }

    // Convert base64 to blob
    const base64Data = imageUrl.split(',')[1];
    const imageBlob = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload to Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const fileName = `banner-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('promotional-banners')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('promotional-banners')
      .getPublicUrl(fileName);

    console.log('Banner generated successfully:', publicUrl);

    return new Response(
      JSON.stringify({ bannerUrl: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-promotional-banner:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
