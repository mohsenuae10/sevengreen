import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';

export default function PrivacyPolicy() {
  const { t, language, getLocalizedPath } = useLanguageCurrency();

  const breadcrumbs = [
    { name: t('nav.home'), url: getLocalizedPath('/') },
    { name: t('nav.privacyPolicy'), url: getLocalizedPath('/privacy-policy') }
  ];

  return (
    <>
      <SEOHead
        title={t('policies.privacyTitle')}
        description={t('policies.privacyDesc')}
        keywords={t('policies.privacyKeywords')}
        url={`https://lamsetbeauty.com${getLocalizedPath('/privacy-policy')}`}
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbs} />
      
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-center mb-4 text-primary">
                {t('policies.privacyPageTitle')}
              </h1>
              <p className="text-center text-muted-foreground mb-8">
                {t('policies.lastUpdated')} {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
              </p>

              <Card>
                <CardContent className="p-8 space-y-6">
                  {language === 'ar' ? (
                    <>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">مقدمة</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      نحن في لمسة بيوتي نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا للمعلومات التي تقدمها لنا عند استخدام موقعنا الإلكتروني.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">المعلومات التي نجمعها</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      قد نجمع المعلومات التالية:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ms-4">
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
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ms-4">
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
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ms-4">
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
                      <a href={getLocalizedPath('/contact')} className="text-primary hover:underline">{t('policies.contactUs')}</a>.
                    </p>
                  </div>
                    </>
                  ) : (
                    <>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Introduction</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      At Lamset Beauty, we respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and protect the information you provide when using our website.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Information We Collect</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      We may collect the following information:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ms-4">
                      <li>Full name</li>
                      <li>Contact information (email, phone number, address)</li>
                      <li>Order and payment information</li>
                      <li>Shopping preferences and interests</li>
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">How We Use Your Information</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      We use the information we collect for the following purposes:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ms-4">
                      <li>Processing and fulfilling your orders</li>
                      <li>Communicating with you about your orders</li>
                      <li>Improving our products and services</li>
                      <li>Sending promotional offers (with your consent)</li>
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Data Protection</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We are committed to protecting your personal information. We use advanced security measures to protect your data from unauthorized access, modification, disclosure, or destruction.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Cookies</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We use cookies to improve your experience on our website. You can control the use of cookies through your browser settings.
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Sharing Information with Third Parties</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We will not sell, rent, or share your personal information with third parties for marketing purposes without your consent. We may share your information with trusted service providers to help us operate our business (such as shipping companies and payment processors).
                    </p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Your Rights</h2>
                    <p className="text-muted-foreground leading-relaxed mb-2">
                      You have the right to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ms-4">
                      <li>Access your personal data</li>
                      <li>Correct any inaccurate information</li>
                      <li>Request deletion of your data</li>
                      <li>Object to processing of your data</li>
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-3 text-primary">Contact Us</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      If you have any questions about this privacy policy, please{' '}
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