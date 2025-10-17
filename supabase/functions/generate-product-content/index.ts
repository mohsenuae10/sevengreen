import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, productName, category, brand, existingDescription } = await req.json();
    
    console.log('Generate content request:', { type, productName, category });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'all_fields') {
      systemPrompt = 'أنت خبير في منتجات التجميل والعناية. تكتب محتوى احترافي شامل بالعربية الفصحى.';
      userPrompt = `للمنتج "${productName}" من فئة "${category}"${brand ? ` من علامة ${brand}` : ''}، قدم التالي بصيغة JSON:

{
  "description": "وصف تسويقي جذاب (100-150 كلمة) يشرح فوائد المنتج",
  "ingredients": "قائمة بأهم المكونات النشطة مع شرح مختصر لكل مكون (50-80 كلمة)",
  "benefits": "قائمة بالفوائد الرئيسية للمنتج (4-6 نقاط، كل نقطة 10-15 كلمة)",
  "howToUse": "خطوات الاستخدام بشكل واضح ومرتب (3-5 خطوات)"
}

قدم JSON فقط بدون أي نص إضافي.`;
    } else if (type === 'description') {
      systemPrompt = 'أنت كاتب محتوى تسويقي متخصص في منتجات التجميل والعناية. تكتب نصوصاً احترافية وجذابة بالعربية الفصحى.';
      userPrompt = `اكتب وصفاً تسويقياً احترافياً بالعربية لمنتج "${productName}" من فئة "${category}"${brand ? ` من علامة ${brand}` : ''}.

الوصف يجب أن:
- يكون بطول 100-150 كلمة
- يشرح فوائد المنتج بشكل جذاب
- يكون محفزاً للشراء
- يستخدم لغة عربية فصحى واضحة
- لا يحتوي على أي رموز أو علامات markdown

قدم الوصف مباشرة بدون أي مقدمات.`;
    } else if (type === 'ingredients') {
      systemPrompt = 'أنت خبير في مكونات منتجات التجميل. تشرح المكونات بطريقة علمية واضحة باللغة العربية.';
      userPrompt = `للمنتج "${productName}" من فئة "${category}"${brand ? ` من علامة ${brand}` : ''}, قدم قائمة بأهم المكونات النشطة المتوقعة مع شرح مختصر لفائدة كل مكون.

اكتب بطول 50-80 كلمة بصيغة نقاط أو فقرة واحدة. قدم المحتوى مباشرة بدون مقدمات.`;
    } else if (type === 'benefits') {
      systemPrompt = 'أنت خبير في فوائد منتجات التجميل. تكتب فوائد واضحة ومقنعة باللغة العربية.';
      userPrompt = `للمنتج "${productName}" من فئة "${category}"${brand ? ` من علامة ${brand}` : ''}, قدم قائمة بالفوائد الرئيسية (4-6 نقاط).

كل نقطة يجب أن تكون 10-15 كلمة. اكتب بصيغة نقاط واضحة. قدم المحتوى مباشرة بدون مقدمات.`;
    } else if (type === 'how_to_use') {
      systemPrompt = 'أنت خبير في طرق استخدام منتجات التجميل. تشرح الخطوات بوضوح باللغة العربية.';
      userPrompt = `للمنتج "${productName}" من فئة "${category}"${brand ? ` من علامة ${brand}` : ''}, قدم خطوات الاستخدام الصحيحة.

اكتب 3-5 خطوات واضحة ومرتبة. كل خطوة يجب أن تكون واضحة ومختصرة. قدم المحتوى مباشرة بدون مقدمات.`;
    } else if (type === 'seo') {
      systemPrompt = 'أنت خبير SEO متخصص في التجارة الإلكترونية العربية. تقدم محتوى محسّن لمحركات البحث باللغة العربية.';
      userPrompt = `للمنتج "${productName}" من فئة "${category}"${brand ? ` من علامة ${brand}` : ''}${existingDescription ? `\n\nوصف المنتج: ${existingDescription}` : ''}, قدم التالي:

1. عنوان SEO (50-60 حرف فقط) يحتوي على الكلمات المفتاحية الرئيسية
2. وصف SEO (150-160 حرف فقط) جذاب ويحفز على الشراء
3. 5-7 كلمات مفتاحية مهمة (مفصولة بفواصل)

قدم الإجابة بصيغة JSON فقط بدون أي نص إضافي:
{
  "seoTitle": "العنوان هنا",
  "seoDescription": "الوصف هنا",
  "seoKeywords": "كلمة1, كلمة2, كلمة3"
}`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'تم تجاوز الحد المسموح. حاول مرة أخرى بعد قليل.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'نفاذ رصيد الذكاء الاصطناعي. يرجى إضافة رصيد.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log('Generated content:', generatedText.substring(0, 200));

    if (type === 'all_fields') {
      let fieldsData;
      try {
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          fieldsData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch (e) {
        console.error('Failed to parse all_fields data:', e);
        fieldsData = {
          description: generatedText.substring(0, 500),
          ingredients: '',
          benefits: '',
          howToUse: ''
        };
      }

      return new Response(
        JSON.stringify(fieldsData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (type === 'description' || type === 'ingredients' || type === 'benefits' || type === 'how_to_use') {
      return new Response(
        JSON.stringify({ content: generatedText.trim() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (type === 'seo') {
      // محاولة استخراج JSON من النص
      let seoData;
      try {
        // البحث عن JSON في النص
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          seoData = JSON.parse(jsonMatch[0]);
        } else {
          // إذا لم يكن JSON، نحاول تحليل النص
          const lines = generatedText.split('\n').filter((line: string) => line.trim());
          seoData = {
            seoTitle: lines[0]?.replace(/^["']|["']$/g, '').trim() || productName,
            seoDescription: lines[1]?.replace(/^["']|["']$/g, '').trim() || '',
            seoKeywords: lines[2]?.replace(/^["']|["']$/g, '').trim() || ''
          };
        }
      } catch (e) {
        console.error('Failed to parse SEO data:', e);
        seoData = {
          seoTitle: productName,
          seoDescription: existingDescription || '',
          seoKeywords: category
        };
      }

      return new Response(
        JSON.stringify(seoData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid type' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in generate-product-content:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'حدث خطأ غير متوقع' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
