import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';

export default function TermsOfService() {
  const { t, language, getLocalizedPath } = useLanguageCurrency();

  const breadcrumbs = [
    { name: t('nav.home'), url: getLocalizedPath('/') },
    { name: t('nav.termsOfService'), url: getLocalizedPath('/terms-of-service') }
  ];

  return (
    <>
      <SEOHead
        title={t('policies.termsTitle')}
        description={t('policies.termsDesc')}
        keywords={t('policies.termsKeywords')}
        url={`https://lamsetbeauty.com${getLocalizedPath('/terms-of-service')}`}
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbs} />
      
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-center mb-4 text-primary">
                {t('policies.termsPageTitle')}
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                {t('policies.lastUpdated')} {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
              </p>

              <Card>
                <CardContent className="p-8 space-y-6">
                  {language === 'ar' ? (
                    <>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">الموافقة على الشروط</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      باستخدام موقع لمسة بيوتي، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء من هذه الشروط، فيرجى عدم استخدام موقعنا.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">استخدام الموقع</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      يجب عليك:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ms-4">
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
                      جميع المحتويات على هذا الموقع، بما في ذلك النصوص والصور والشعارات، هي ملك لـ لمسة بيوتي ومحمية بموجب قوانين حقوق النشر والملكية الفكرية.
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
                      <a href={getLocalizedPath('/contact')} className="text-primary hover:underline">{t('policies.contactUs')}</a>.
                    </p>
                  </div>
                    </>
                  ) : (
                    <>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Agreement to Terms</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      By using the Lamset Beauty website, you agree to comply with these terms and conditions. If you do not agree to any part of these terms, please do not use our website.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Use of the Website</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      You must:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ms-4">
                      <li>Provide accurate and truthful information when placing orders</li>
                      <li>Maintain the confidentiality of your account information</li>
                      <li>Use the website for legal purposes only</li>
                      <li>Not attempt unauthorized access to any part of the website</li>
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Orders and Payment</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      When placing an order, you are making an offer to purchase products. All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason. Prices are subject to change without prior notice.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Product Information</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We make every effort to display our products accurately. However, we do not guarantee that product descriptions, images, or other content on the website are accurate, complete, or error-free.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Intellectual Property</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      All content on this website, including text, images, and logos, is the property of Lamset Beauty and is protected by copyright and intellectual property laws.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Limitation of Liability</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from the use or inability to use our website or products.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Governing Law</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      These terms and conditions are governed by and construed in accordance with the laws of the Kingdom of Saudi Arabia.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Amendments</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We reserve the right to modify these terms at any time. Any changes will be posted on this page, and you are advised to review them regularly.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Contact</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      For any inquiries about the terms of service, please{' '}
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