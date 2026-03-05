import Head from 'next/head';
import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';
import { Link } from '@/hooks/useNextRouter';

export default function FAQ() {
  const { t, getLocalizedPath } = useLanguageCurrency();

  const breadcrumbs = [
    { name: t('nav.home'), url: getLocalizedPath('/') },
    { name: t('nav.faq'), url: getLocalizedPath('/faq') }
  ];

  const faqs = Array.from({ length: 10 }, (_, i) => ({
    question: t(`faq.q${i + 1}`),
    answer: t(`faq.a${i + 1}`),
  }));

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': 'https://lamsetbeauty.com/faq#faqpage',
    headline: t('faq.title'),
    description: t('faq.description'),
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <SEOHead
        title={t('faq.seoTitle')}
        description={t('faq.seoDesc')}
        keywords={t('faq.seoKeywords')}
        url={`https://lamsetbeauty.com${getLocalizedPath('/faq')}`}
        type="article"
      />
      <BreadcrumbSchema items={breadcrumbs} />
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </Head>
      
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-center mb-4 text-primary">
                {t('faq.pageTitle')}
              </h1>
              <p className="text-center text-lg text-muted-foreground mb-12">
                {t('faq.subtitle')}
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
                  {t('faq.notFoundAnswer')}
                </p>
                <Link 
                  to={getLocalizedPath('/contact')} 
                  className="text-primary hover:underline font-medium"
                >
                  {t('faq.contactUs')}
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}