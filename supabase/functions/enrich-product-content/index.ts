import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProductEnrichmentRequest {
  productId: string;
  productName: string;
  category: string;
  shortDescription?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!supabaseUrl || !supabaseKey || !lovableApiKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { productId, productName, category, shortDescription } = await req.json() as ProductEnrichmentRequest;

    console.log(`📝 Enriching content for product: ${productName}`);

    // استخدام Lovable AI لتوليد محتوى غني بالعربية
    const prompt = `أنت خبير في كتابة محتوى تسويقي لمنتجات التجميل والعناية الطبيعية.

اكتب محتوى SEO-friendly بالعربية للمنتج التالي:
- اسم المنتج: ${productName}
- الفئة: ${category}
${shortDescription ? `- وصف مختصر: ${shortDescription}` : ''}

المطلوب بصيغة JSON:
{
  "long_description_ar": "وصف طويل 300-400 كلمة يشرح المنتج بالتفصيل، فوائده، استخداماته، ولماذا يجب شراؤه",
  "key_features": ["ميزة 1", "ميزة 2", "ميزة 3", "ميزة 4", "ميزة 5"],
  "why_choose": ["سبب 1", "سبب 2", "سبب 3"],
  "faqs": [
    {"question": "سؤال شائع 1؟", "answer": "إجابة تفصيلية"},
    {"question": "سؤال شائع 2؟", "answer": "إجابة تفصيلية"},
    {"question": "سؤال شائع 3؟", "answer": "إجابة تفصيلية"},
    {"question": "سؤال شائع 4؟", "answer": "إجابة تفصيلية"}
  ]
}

تأكد من:
- استخدام لغة تسويقية جذابة
- التركيز على الفوائد وليس المواصفات فقط
- استخدام كلمات مفتاحية SEO-friendly
- الكتابة بأسلوب طبيعي وسلس`;

    const aiResponse = await fetch('https://lovable.app/api/ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated from AI');
    }

    // استخراج JSON من الاستجابة
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from AI response');
    }

    const enrichedContent = JSON.parse(jsonMatch[0]);

    // تحديث المنتج في قاعدة البيانات
    const { error: updateError } = await supabase
      .from('products')
      .update({
        long_description_ar: enrichedContent.long_description_ar,
        key_features: enrichedContent.key_features,
        why_choose: enrichedContent.why_choose,
        faqs: enrichedContent.faqs,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (updateError) {
      throw new Error(`Failed to update product: ${updateError.message}`);
    }

    console.log(`✅ Content enriched successfully for: ${productName}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Content enriched successfully',
        data: enrichedContent,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error enriching content:', error);
    
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
