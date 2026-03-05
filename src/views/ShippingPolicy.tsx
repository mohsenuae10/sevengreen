import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';

export default function ShippingPolicy() {
  const { t, language, getLocalizedPath } = useLanguageCurrency();

  const breadcrumbs = [
    { name: t('nav.home'), url: getLocalizedPath('/') },
    { name: t('nav.shippingPolicy'), url: getLocalizedPath('/shipping-policy') }
  ];

  return (
    <>
      <SEOHead
        title={t('policies.shippingTitle')}
        description={t('policies.shippingDesc')}
        keywords={t('policies.shippingKeywords')}
        url={`https://lamsetbeauty.com${getLocalizedPath('/shipping-policy')}`}
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbs} />
      
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-center mb-4 text-primary">
                {t('policies.shippingPageTitle')}
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                {t('policies.shippingSubtitle')}
              </p>

              <Card>
                <CardContent className="p-8 space-y-6">
                  {language === 'ar' ? (
                    <>
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
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ms-4">
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
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ms-4">
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
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ms-4">
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
                      <a href={getLocalizedPath('/contact')} className="text-primary hover:underline">{t('policies.contactUs')}</a>.
                    </p>
                  </div>
                    </>
                  ) : (
                    <>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Coverage Areas</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We ship to all regions of Saudi Arabia. We are working to expand our services to include Gulf countries soon.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Delivery Times</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      Expected delivery times:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ms-4">
                      <li><strong>Major cities:</strong> 2-3 business days</li>
                      <li><strong>Other areas:</strong> 3-5 business days</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-3">
                      <em>Note: Delivery times may be affected by weather conditions or public holidays.</em>
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Shipping Costs</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      Shipping costs vary based on:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ms-4">
                      <li>Delivery location</li>
                      <li>Order size and weight</li>
                      <li>Selected shipping method</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-3">
                      Shipping costs will be automatically calculated at checkout before payment.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Free Shipping</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We offer free shipping on all orders over <strong>200 SAR</strong> within the Kingdom.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Order Processing</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Orders are processed within 24 hours of receipt (business days). You will receive an email with shipping confirmation and tracking number once your order is shipped.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Order Tracking</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Once your order is shipped, you will receive an email containing a tracking number. You can use this number to track your shipment through the shipping company's website.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Receiving Your Order</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      When receiving your order:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ms-4">
                      <li>Check the package for any visible damage</li>
                      <li>Verify that the order contents match the invoice</li>
                      <li>If there are any issues, contact us immediately</li>
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Orders Damaged During Shipping</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      If you received a damaged order, please contact us within 48 hours with photos of the packaging and damaged product. We will replace the product or fully refund the amount.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Undelivered Orders</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      If you haven't received your order within the expected time, please check the tracking status first. If there's an issue, contact us and we'll help you track your shipment or send a replacement.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Questions?</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      For any shipping inquiries, please{' '}
                      <a href={getLocalizedPath('/contact')} className="text-primary hover:underline">{t('policies.contactUs')}</a>.
                    </p>
                  </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}