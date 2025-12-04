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
    const { product } = await req.json();
    
    if (!product) {
      return new Response(
        JSON.stringify({ error: 'Product data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

const systemPrompt = `أنت كاتب محتوى محترف متخصص في مجال التجميل والعناية بالبشرة والشعر.
مهمتك كتابة مقال احترافي وشامل باللغة العربية عن منتج معين.

المقال يجب أن يكون:
- غني بالمعلومات المفيدة للقارئ
- محسّن لمحركات البحث (SEO)
- يتضمن نصائح عملية للاستخدام
- يجيب على الأسئلة الشائعة
- يستخدم HTML للتنسيق (h2, h3, p, ul, ol, strong, em, blockquote, figure, figcaption, a, img)

الروابط الداخلية (مهم جداً لـ SEO):
1. أضف رابط لصفحة المنتج في المقدمة والخاتمة: <a href="https://lamsetbeauty.com/product/PRODUCT_SLUG">اسم المنتج</a>
2. أضف رابط لصفحة الأسئلة الشائعة في قسم الأسئلة: <a href="https://lamsetbeauty.com/faq">المزيد من الأسئلة الشائعة</a>
3. أضف رابط لصفحة المنتجات: <a href="https://lamsetbeauty.com/products">تصفح جميع المنتجات</a>

صورة المنتج (أضفها في بداية المقال بعد المقدمة):
<figure>
  <img src="PRODUCT_IMAGE_URL" alt="اسم المنتج" loading="lazy" />
  <figcaption>اسم المنتج</figcaption>
</figure>

مهم جداً:
- لا تستخدم أي ألوان inline (مثل style="color:...")
- لا تستخدم أي styles مباشرة في HTML
- استخدم فقط عناصر HTML البسيطة بدون أي attributes للتنسيق
- الألوان والتنسيق سيتم تطبيقها تلقائياً من CSS
- استبدل PRODUCT_SLUG و PRODUCT_IMAGE_URL بالقيم الفعلية المعطاة

أجب بصيغة JSON فقط بدون أي نص إضافي.`;

    const userPrompt = `اكتب مقال احترافي شامل عن هذا المنتج:

اسم المنتج: ${product.name_ar}
الوصف: ${product.description_ar || 'غير متوفر'}
الفئة: ${product.category_ar || product.category}
الفوائد: ${product.benefits_ar || 'غير متوفر'}
طريقة الاستخدام: ${product.how_to_use_ar || 'غير متوفر'}
المكونات: ${product.ingredients_ar || 'غير متوفر'}

معلومات للروابط الداخلية (استخدمها في المحتوى):
- رابط صفحة المنتج: https://lamsetbeauty.com/product/${product.slug || product.id}
- صورة المنتج: ${product.image_url || ''}

أريد الرد بصيغة JSON التالية:
{
  "title_ar": "عنوان جذاب للمقال يتضمن اسم المنتج (50-70 حرف)",
  "excerpt_ar": "ملخص قصير وجذاب للمقال (150-200 حرف)",
  "content_ar": "محتوى المقال الكامل بتنسيق HTML (1500-2500 كلمة) يتضمن: مقدمة مع رابط للمنتج، صورة المنتج، فوائد المنتج، طريقة الاستخدام، نصائح، أسئلة شائعة مع رابط لصفحة FAQ، خاتمة مع رابط الشراء",
  "meta_title": "عنوان SEO (50-60 حرف)",
  "meta_description": "وصف SEO جذاب (150-160 حرف)",
  "meta_keywords": "كلمات مفتاحية مفصولة بفواصل (5-8 كلمات)",
  "reading_time": رقم تقديري لوقت القراءة بالدقائق
}`;

    console.log('Generating blog content for product:', product.name_ar);

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
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'تم تجاوز حد الطلبات، يرجى المحاولة لاحقاً' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'الرصيد غير كافي، يرجى شحن الرصيد' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error('No content generated');
    }

    // Parse JSON from response
    let blogContent;
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = generatedText;
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.split('```json')[1].split('```')[0];
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.split('```')[1].split('```')[0];
      }
      blogContent = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', generatedText);
      throw new Error('Failed to parse generated content');
    }

    console.log('Successfully generated blog content');

    return new Response(
      JSON.stringify({ success: true, content: blogContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating blog content:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء توليد المحتوى';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
