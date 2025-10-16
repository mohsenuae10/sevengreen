import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsOfService() {
  const breadcrumbs = [
    { name: 'الرئيسية', url: '/' },
    { name: 'شروط الخدمة', url: '/terms-of-service' }
  ];

  return (
    <>
      <SEOHead
        title="شروط الخدمة - Seven Green | سفن جرين"
        description="شروط وأحكام استخدام موقع Seven Green. اطلع على القواعد والإرشادات عند التسوق معنا."
        keywords="شروط الخدمة, الأحكام, شروط الاستخدام"
        url="/terms-of-service"
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbs} />
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-center mb-4 text-primary">
                شروط الخدمة
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
              </p>

              <Card>
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">الموافقة على الشروط</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      باستخدام موقع Seven Green، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، فيرجى عدم استخدام موقعنا.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">استخدام الموقع</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      يجب عليك:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                      <li>تقديم معلومات صحيحة ودقيقة عند إجراء الطلبات</li>
                      <li>الحفاظ على سرية معلومات حسابك</li>
                      <li>استخدام الموقع للأغراض القانونية فقط</li>
                      <li>عدم محاولة الوصول غير المصرح به إلى أي جزء من الموقع</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">الطلبات والدفع</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      عند تقديم طلب، فإنك تقدم عرضاً لشراء المنتجات. جميع الطلبات تخضع للقبول والتوافر. نحتفظ بالحق في رفض أو إلغاء أي طلب لأي سبب. الأسعار عرضة للتغيير دون إشعار مسبق.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">معلومات المنتج</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      نبذل قصارى جهدنا لعرض منتجاتنا بدقة. ومع ذلك، لا نضمن أن أوصاف المنتجات أو الصور أو المحتويات الأخرى على الموقع دقيقة أو كاملة أو خالية من الأخطاء.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">الملكية الفكرية</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      جميع المحتويات على هذا الموقع، بما في ذلك النصوص والصور والشعارات، هي ملك لـ Seven Green ومحمية بموجب قوانين حقوق النشر والملكية الفكرية.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">تحديد المسؤولية</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      لن نكون مسؤولين عن أي أضرار مباشرة أو غير مباشرة أو عرضية أو خاصة أو تبعية ناتجة عن استخدام أو عدم القدرة على استخدام موقعنا أو منتجاتنا.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">القانون الساري</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      تخضع هذه الشروط والأحكام لقوانين المملكة العربية السعودية وتفسر وفقاً لها.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">التعديلات</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر أي تغييرات على هذه الصفحة، ويُنصح بمراجعتها بانتظام.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">التواصل</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      لأي استفسارات حول شروط الخدمة، يرجى{' '}
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
