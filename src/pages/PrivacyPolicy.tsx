import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPolicy() {
  const breadcrumbs = [
    { name: 'الرئيسية', url: '/' },
    { name: 'سياسة الخصوصية', url: '/privacy-policy' }
  ];

  return (
    <>
      <SEOHead
        title="سياسة الخصوصية - Seven Green | سفن جرين"
        description="سياسة الخصوصية لمتجر Seven Green. تعرف على كيفية جمع واستخدام وحماية معلوماتك الشخصية."
        keywords="سياسة الخصوصية, حماية البيانات, الأمان"
        url="/privacy-policy"
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbs} />
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-center mb-4 text-primary">
                سياسة الخصوصية
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
              </p>

              <Card>
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">مقدمة</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      نحن في Seven Green نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا للمعلومات التي تقدمها لنا عند استخدام موقعنا الإلكتروني.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">المعلومات التي نجمعها</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      قد نجمع المعلومات التالية:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                      <li>الاسم الكامل</li>
                      <li>معلومات الاتصال (البريد الإلكتروني، رقم الهاتف، العنوان)</li>
                      <li>معلومات الطلب والدفع</li>
                      <li>تفضيلات التسوق والاهتمامات</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">كيف نستخدم معلوماتك</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      نستخدم المعلومات التي نجمعها للأغراض التالية:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                      <li>معالجة وتنفيذ طلباتك</li>
                      <li>التواصل معك بشأن طلباتك</li>
                      <li>تحسين منتجاتنا وخدماتنا</li>
                      <li>إرسال عروض ترويجية (في حال الموافقة)</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">حماية البيانات</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      نلتزم بحماية معلوماتك الشخصية. نستخدم إجراءات أمنية متقدمة لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">ملفات تعريف الارتباط (Cookies)</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا. يمكنك التحكم في استخدام ملفات تعريف الارتباط من خلال إعدادات المتصفح الخاص بك.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">مشاركة المعلومات مع أطراف ثالثة</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      لن نبيع أو نؤجر أو نشارك معلوماتك الشخصية مع أطراف ثالثة لأغراض تسويقية دون موافقتك. قد نشارك معلوماتك مع مزودي خدمات موثوقين لمساعدتنا في تشغيل أعمالنا (مثل شركات الشحن ومعالجي الدفع).
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">حقوقك</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      لديك الحق في:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                      <li>الوصول إلى بياناتك الشخصية</li>
                      <li>تصحيح أي معلومات غير دقيقة</li>
                      <li>طلب حذف بياناتك</li>
                      <li>الاعتراض على معالجة بياناتك</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">التواصل معنا</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى{' '}
                      <a href="/contact" className="text-primary hover:underline">التواصل معنا</a>.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
