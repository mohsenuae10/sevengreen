import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';

export default function FAQ() {
  const breadcrumbs = [
    { name: 'الرئيسية', url: '/' },
    { name: 'الأسئلة الشائعة', url: '/faq' }
  ];

  const faqs = [
    {
      question: 'ما هي منتجات Seven Green؟',
      answer: 'Seven Green متجر متخصص في منتجات العناية الطبيعية، نقدم صوابين طبيعية، شامبوهات، ومنتجات تجميل خالية من المواد الكيميائية الضارة، مصنوعة من مكونات طبيعية 100%.'
    },
    {
      question: 'هل المنتجات آمنة للبشرة الحساسة؟',
      answer: 'نعم، جميع منتجاتنا طبيعية وخالية من المواد الكيميائية القاسية، مما يجعلها مناسبة للبشرة الحساسة. ومع ذلك، ننصح دائماً بإجراء اختبار بسيط على جزء صغير من الجلد قبل الاستخدام الكامل.'
    },
    {
      question: 'كم مدة توصيل الطلبات؟',
      answer: 'نوصل طلباتك خلال 2-5 أيام عمل داخل المملكة العربية السعودية. سيتم إرسال رقم التتبع عبر البريد الإلكتروني فور شحن طلبك.'
    },
    {
      question: 'ما هي طرق الدفع المتاحة؟',
      answer: 'نقبل الدفع عبر بطاقات الائتمان (Visa, Mastercard, Mada) وApple Pay. جميع المدفوعات آمنة ومشفرة.'
    },
    {
      question: 'هل يمكنني إرجاع أو استبدال المنتج؟',
      answer: 'نعم، يمكنك إرجاع المنتجات غير المستخدمة خلال 14 يوماً من تاريخ الاستلام. يرجى مراجعة سياسة الإرجاع للمزيد من التفاصيل.'
    },
    {
      question: 'كيف أحافظ على المنتجات الطبيعية؟',
      answer: 'للحفاظ على جودة المنتجات الطبيعية، يُنصح بتخزينها في مكان بارد وجاف بعيداً عن أشعة الشمس المباشرة. استخدم الصوابين الطبيعية خلال 6-12 شهراً من فتحها.'
    },
    {
      question: 'هل المنتجات مناسبة للأطفال؟',
      answer: 'نعم، معظم منتجاتنا الطبيعية مناسبة للأطفال. ومع ذلك، يرجى قراءة وصف كل منتج بعناية والتأكد من أنه مناسب لعمر طفلك.'
    },
    {
      question: 'هل تشحنون خارج السعودية؟',
      answer: 'حالياً، نقوم بالشحن داخل المملكة العربية السعودية فقط. نعمل على توسيع خدماتنا لتشمل دول الخليج قريباً.'
    },
    {
      question: 'كيف يمكنني تتبع طلبي؟',
      answer: 'سيتم إرسال رقم التتبع إلى بريدك الإلكتروني فور شحن طلبك. يمكنك استخدام هذا الرقم لتتبع شحنتك عبر موقع شركة الشحن.'
    },
    {
      question: 'هل تقدمون عينات مجانية؟',
      answer: 'نقدم عروضاً خاصة وهدايا مجانية من وقت لآخر. تابعنا على وسائل التواصل الاجتماعي لمعرفة آخر العروض والهدايا المتاحة.'
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <SEOHead
        title="الأسئلة الشائعة - Seven Green | سفن جرين"
        description="أجوبة على الأسئلة الشائعة حول منتجات Seven Green الطبيعية، الشحن، الإرجاع، وطرق الدفع."
        keywords="أسئلة شائعة, FAQ, استفسارات, خدمة العملاء, سفن جرين"
        url="/faq"
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbs} />
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-center mb-4 text-primary">
                الأسئلة الشائعة
              </h1>
              <p className="text-center text-lg text-muted-foreground mb-12">
                إجابات على الأسئلة الأكثر شيوعاً
              </p>

              <Card>
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-right">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>

              <div className="mt-8 text-center">
                <p className="text-muted-foreground mb-4">
                  لم تجد إجابة لسؤالك؟
                </p>
                <a 
                  href="/contact" 
                  className="text-primary hover:underline font-medium"
                >
                  تواصل معنا
                </a>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
