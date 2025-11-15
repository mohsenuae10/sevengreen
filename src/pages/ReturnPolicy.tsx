import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';

export default function ReturnPolicy() {
  const breadcrumbs = [
    { name: 'الرئيسية', url: '/' },
    { name: 'سياسة الإرجاع', url: '/return-policy' }
  ];

  return (
    <>
      <SEOHead
        title="سياسة الإرجاع والاستبدال - لمسة الجمال | Lamset Beauty"
        description="سياسة الإرجاع والاستبدال لمنتجات لمسة الجمال. تعرف على شروط وإجراءات إرجاع المنتجات واسترداد الأموال."
        keywords="سياسة الإرجاع, الاستبدال, استرداد الأموال, لمسة الجمال"
        url="https://lamsetbeauty.com/return-policy"
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbs} />
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-center mb-4 text-primary">
                سياسة الإرجاع والاستبدال
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                نسعى لرضاك الكامل عن منتجاتنا
              </p>

              <Card>
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">فترة الإرجاع</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      يمكنك إرجاع المنتجات غير المستخدمة في حالتها الأصلية خلال <strong>14 يوماً</strong> من تاريخ استلام الطلب.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">شروط الإرجاع</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      لقبول الإرجاع، يجب أن تستوفي المنتجات الشروط التالية:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                      <li>المنتج غير مستخدم وفي حالته الأصلية</li>
                      <li>العبوة الأصلية سليمة وغير تالفة</li>
                      <li>جميع الملصقات والأختام الأصلية سليمة</li>
                      <li>إرفاق فاتورة الشراء الأصلية</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">المنتجات غير القابلة للإرجاع</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      لأسباب صحية وسلامة، لا يمكن إرجاع:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                      <li>المنتجات المفتوحة أو المستخدمة</li>
                      <li>المنتجات التي تم تخصيصها أو طلبها خصيصاً</li>
                      <li>المنتجات المعروضة للبيع بأسعار مخفضة نهائياً</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">كيفية الإرجاع</h2>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground mr-4">
                      <li>
                        <a href="/contact" className="text-primary hover:underline">تواصل معنا</a> خلال 14 يوماً من استلام الطلب
                      </li>
                      <li>قدم رقم الطلب وسبب الإرجاع</li>
                      <li>سنرسل لك تعليمات الإرجاع ورقم التتبع</li>
                      <li>أعد المنتج في عبوته الأصلية مع الفاتورة</li>
                      <li>سيتم فحص المنتج عند الاستلام</li>
                    </ol>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">تكاليف الإرجاع</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      في حالة الإرجاع بسبب عيب في المنتج أو خطأ من طرفنا، سنتحمل تكاليف الشحن. في الحالات الأخرى، يتحمل العميل تكاليف الشحن.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">استرداد الأموال</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      بعد استلام المنتج المرتجع والتأكد من استيفائه للشروط، سيتم معالجة استرداد المبلغ خلال 5-10 أيام عمل إلى نفس طريقة الدفع المستخدمة في الشراء.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">الاستبدال</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      نقبل استبدال المنتجات بمنتجات أخرى من نفس القيمة أو أعلى (مع دفع الفرق) ضمن نفس شروط الإرجاع.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">المنتجات التالفة أو الخاطئة</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      إذا استلمت منتجاً تالفاً أو خاطئاً، يرجى التواصل معنا فوراً مع صور للمنتج. سنستبدل المنتج أو نسترد المبلغ بالكامل دون تحمل أي تكاليف إضافية.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">أسئلة؟</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      إذا كان لديك أي استفسارات حول سياسة الإرجاع، يرجى{' '}
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
