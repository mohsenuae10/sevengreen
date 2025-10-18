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
    let prompt = `Create a professional, eye-catching promotional banner for an Arabic e-commerce store called "Seven Green | سفن جرين" (natural cosmetics).

Banner Description (follow this exactly): ${bannerDescription}

Design requirements:
- Size: 1536x512 pixels (wide banner format - landscape orientation)
- The banner MUST be 1536 pixels wide and 512 pixels tall
- All text must be in Arabic with clear, readable fonts
- Include "Seven Green | سفن جرين" branding
- Professional, clean, and attractive design
- High contrast for readability
- Modern, elegant aesthetic matching a natural cosmetics brand
- Ultra high resolution`;

    if (productInfo) {
      prompt += `\n\nProduct to feature (if relevant to description): ${productInfo.name}
Use natural, organic color schemes that complement the product.`;
    }

    prompt += `\n\nIMPORTANT: 
- Follow the user's description precisely
- Maintain aspect ratio: WIDE banner (1536x512)
- Ensure all Arabic text is clear and prominent
- Make it visually stunning and professional`;

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
