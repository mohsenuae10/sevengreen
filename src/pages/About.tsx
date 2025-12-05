import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Heart, Shield, Users } from 'lucide-react';

export default function About() {
  const breadcrumbs = [
    { name: 'الرئيسية', url: '/' },
    { name: 'من نحن', url: '/about' }
  ];

  return (
    <>
      <SEOHead
        title="من نحن - لمسة بيوتي | Lamset Beauty"
        description="تعرفي على لمسة بيوتي، متجرك المتخصص في منتجات الجمال والعناية الفاخرة. نوفر مستحضرات تجميل أصلية بأعلى جودة."
        keywords="من نحن لمسة بيوتي, عن المتجر, منتجات جمال, مستحضرات تجميل"
        url="/about"
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbs} />
      
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold text-center mb-4 text-primary">
                من نحن
              </h1>
              <p className="text-center text-lg text-muted-foreground mb-12">
                رحلتنا في عالم الجمال الطبيعي
              </p>

              <div className="prose prose-lg max-w-none mb-12">
                <Card>
                  <CardContent className="p-8">
                     <h2 className="text-2xl font-bold mb-4 text-primary">قصتنا</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      لمسة بيوتي بدأت من شغف عميق بعالم الجمال والعناية الفاخرة. نحن متجر متخصص في تقديم منتجات الجمال عالية الجودة، من مستحضرات تجميل أصلية إلى منتجات عناية مميزة.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      نؤمن بأن الجمال الحقيقي يأتي من العناية المتميزة، ولذلك نختار كل منتج بعناية فائقة لضمان أفضل تجربة لعملائنا الكرام.
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
                      <h3 className="text-xl font-bold">منتجات طبيعية 100%</h3>
                    </div>
                    <p className="text-muted-foreground">
                      جميع منتجاتنا مصنوعة من مكونات طبيعية خالصة، دون أي مواد كيميائية ضارة أو مواد حافظة صناعية.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">جودة مضمونة</h3>
                    </div>
                    <p className="text-muted-foreground">
                      نختار منتجاتنا بعناية فائقة ونضمن أعلى معايير الجودة والسلامة لبشرتك وشعرك.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Heart className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">عناية شخصية</h3>
                    </div>
                    <p className="text-muted-foreground">
                      نهتم بكل عميل ونسعى لتقديم أفضل تجربة تسوق وخدمة عملاء استثنائية.
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">مجتمع متنامي</h3>
                    </div>
                    <p className="text-muted-foreground">
                      انضم إلى آلاف العملاء الراضين الذين اختاروا الطبيعة طريقاً للعناية بأنفسهم.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-primary/5">
                <CardContent className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4 text-primary">رؤيتنا</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    نسعى لأن نكون الخيار الأول في المملكة العربية السعودية لمنتجات العناية الطبيعية، 
                    ونطمح لنشر ثقافة الجمال الطبيعي الصحي في كل بيت.
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
