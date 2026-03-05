import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Heart, Shield, Users } from 'lucide-react';
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';

export default function About() {
  const { t, getLocalizedPath } = useLanguageCurrency();

  const breadcrumbs = [
    { name: t('nav.home'), url: getLocalizedPath('/') },
    { name: t('nav.about'), url: getLocalizedPath('/about') }
  ];

  return (
    <>
      <SEOHead
        title={t('about.title')}
        description={t('about.description')}
        keywords={t('about.seoKeywords')}
        url={getLocalizedPath('/about')}
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbs} />
      
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-center mb-4 text-primary">
                {t('nav.about')}
              </h1>
              <p className="text-center text-lg text-muted-foreground mb-12">
                {t('about.ourJourney')}
              </p>

              <div className="prose prose-lg max-w-none mb-12">
                <Card>
                  <CardContent className="p-8">
                     <h2 className="text-2xl font-bold mb-4 text-primary">{t('about.ourStory')}</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {t('about.storyText1')}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('about.storyText2')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Leaf className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">{t('about.naturalProducts')}</h3>
                    </div>
                    <p className="text-muted-foreground">
                      {t('about.naturalProductsDesc')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">{t('about.guaranteedQuality')}</h3>
                    </div>
                    <p className="text-muted-foreground">
                      {t('about.guaranteedQualityDesc')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Heart className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">{t('about.personalCare')}</h3>
                    </div>
                    <p className="text-muted-foreground">
                      {t('about.personalCareDesc')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">{t('about.growingCommunity')}</h3>
                    </div>
                    <p className="text-muted-foreground">
                      {t('about.growingCommunityDesc')}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-primary/5">
                <CardContent className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4 text-primary">{t('about.ourVision')}</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {t('about.ourVisionText')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
