import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';

export default function ReturnPolicy() {
  const { t, language, getLocalizedPath } = useLanguageCurrency();

  const breadcrumbs = [
    { name: t('nav.home'), url: getLocalizedPath('/') },
    { name: t('nav.returnPolicy'), url: getLocalizedPath('/return-policy') }
  ];

  return (
    <>
      <SEOHead
        title={t('policies.returnTitle')}
        description={t('policies.returnDesc')}
        keywords={t('policies.returnKeywords')}
        url={`https://lamsetbeauty.com${getLocalizedPath('/return-policy')}`}
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbs} />
      
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-center mb-4 text-primary">
                {t('policies.returnPageTitle')}
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                {t('policies.returnSubtitle')}
              </p>

              <Card>
                <CardContent className="p-8 space-y-6">
                  {language === 'ar' ? (
                    <>
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
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ms-4">
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
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ms-4">
                      <li>المنتجات المفتوحة أو المستخدمة</li>
                      <li>المنتجات التي تم تخصيصها أو طلبها خصيصاً</li>
                      <li>المنتجات المعروضة للبيع بأسعار مخفضة نهائياً</li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">كيفية الإرجاع</h2>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground ms-4">
                      <li>
                        <a href={getLocalizedPath('/contact')} className="text-primary hover:underline">{t('policies.contactUs')}</a> خلال 14 يوماً من استلام الطلب
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
                      <a href={getLocalizedPath('/contact')} className="text-primary hover:underline">{t('policies.contactUs')}</a>.
                    </p>
                  </div>
                    </>
                  ) : (
                    <>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Return Period</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      You can return unused products in their original condition within <strong>14 days</strong> of receiving your order.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Return Conditions</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      For a return to be accepted, products must meet the following conditions:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ms-4">
                      <li>Product is unused and in its original condition</li>
                      <li>Original packaging is intact and undamaged</li>
                      <li>All original labels and seals are intact</li>
                      <li>Original purchase invoice is included</li>
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Non-Returnable Products</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      For health and safety reasons, the following cannot be returned:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ms-4">
                      <li>Opened or used products</li>
                      <li>Customized or specially ordered products</li>
                      <li>Products on final clearance sale</li>
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">How to Return</h2>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground ms-4">
                      <li>
                        <a href={getLocalizedPath('/contact')} className="text-primary hover:underline">{t('policies.contactUs')}</a> within 14 days of receiving your order
                      </li>
                      <li>Provide your order number and reason for return</li>
                      <li>We will send you return instructions and a tracking number</li>
                      <li>Return the product in its original packaging with the invoice</li>
                      <li>The product will be inspected upon receipt</li>
                    </ol>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Return Costs</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      If the return is due to a product defect or our error, we will cover the shipping costs. In other cases, the customer bears the shipping costs.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Refunds</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      After receiving the returned product and confirming it meets the conditions, the refund will be processed within 5-10 business days to the same payment method used for the purchase.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Exchanges</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We accept product exchanges for other products of the same or higher value (with the difference paid) under the same return conditions.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Damaged or Incorrect Products</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      If you received a damaged or incorrect product, please contact us immediately with photos of the product. We will replace the product or fully refund the amount without any additional costs.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Questions?</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      If you have any questions about our return policy, please{' '}
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