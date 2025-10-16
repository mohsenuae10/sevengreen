import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';

export default function ShippingPolicy() {
  const breadcrumbs = [
    { name: 'الرئيسية', url: '/' },
    { name: 'سياسة الشحن', url: '/shipping-policy' }
  ];

  return (
    <>
      <SEOHead
        title="سياسة الشحن والتوصيل - Seven Green | سفن جرين"
        description="تعرف على سياسة الشحن والتوصيل في Seven Green، مدة التوصيل، تكاليف الشحن، ومناطق التغطية."
        keywords="سياسة الشحن, التوصيل, مدة الشحن, تكلفة الشحن"
        url="/shipping-policy"
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbs} />
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-center mb-4 text-primary">
                سياسة الشحن والتوصيل
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                نوصل منتجاتنا بأمان وسرعة إلى باب منزلك
              </p>

              <Card>
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">مناطق التغطية</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      نقوم بالشحن إلى جميع مناطق المملكة العربية السعودية. نسعى لتوسيع نطاق خدماتنا لتشمل دول الخليج قريباً.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">مدة التوصيل</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      مدة التوصيل المتوقعة:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                      <li><strong>المدن الرئيسية:</strong> 2-3 أيام عمل</li>
                      <li><strong>المناطق الأخرى:</strong> 3-5 أيام عمل</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-3">
                      <em>ملاحظة: قد تتأثر مدة التوصيل بالظروف الجوية أو الأعياد الرسمية.</em>
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">تكاليف الشحن</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      تختلف تكاليف الشحن حسب:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                      <li>الموقع الجغرافي للتوصيل</li>
                      <li>حجم ووزن الطلب</li>
                      <li>طريقة الشحن المختارة</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-3">
                      سيتم احتساب تكلفة الشحن تلقائياً عند إتمام عملية الشراء قبل الدفع.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">الشحن المجاني</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      نقدم شحناً مجانياً على جميع الطلبات التي تزيد قيمتها عن <strong>200 ريال سعودي</strong> داخل المملكة.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">معالجة الطلبات</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      يتم معالجة الطلبات خلال 24 ساعة من استلامها (أيام العمل). ستتلقى بريداً إلكترونياً بتأكيد الشحن ورقم التتبع بمجرد شحن طلبك.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">تتبع الطلب</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      بمجرد شحن طلبك، ستتلقى رسالة بريد إلكتروني تحتوي على رقم التتبع. يمكنك استخدام هذا الرقم لتتبع شحنتك عبر موقع شركة الشحن.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">استلام الطلب</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      عند استلام طلبك:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mr-4">
                      <li>تحقق من الطرد بحثاً عن أي تلف ظاهري</li>
                      <li>تأكد من تطابق محتويات الطلب مع الفاتورة</li>
                      <li>في حالة وجود أي مشكلة، تواصل معنا فوراً</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">الطلبات التالفة أثناء الشحن</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      إذا استلمت طلباً تالفاً، يرجى التواصل معنا خلال 48 ساعة مع صور للعبوة والمنتج التالف. سنقوم باستبدال المنتج أو استرداد المبلغ كاملاً.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">الطلبات غير المستلمة</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      إذا لم تستلم طلبك خلال المدة المتوقعة، يرجى التحقق من حالة التتبع أولاً. إذا كانت هناك مشكلة، تواصل معنا وسنساعدك في تتبع شحنتك أو إرسال بديل.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">أسئلة؟</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      لأي استفسارات حول الشحن، يرجى{' '}
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
