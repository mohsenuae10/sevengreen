import { Leaf, Sparkles, Heart, Truck, Shield, HeartHandshake } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'منتجات فاخرة',
    description: 'مستحضرات تجميل عالية الجودة من أفضل العلامات التجارية',
    color: 'from-primary to-primary-light',
  },
  {
    icon: Shield,
    title: 'منتجات أصلية 100%',
    description: 'ضمان الأصالة لجميع منتجاتنا',
    color: 'from-primary/90 to-primary',
  },
  {
    icon: Truck,
    title: 'شحن سريع',
    description: 'توصيل سريع لجميع مدن المملكة',
    color: 'from-primary-light to-accent',
  },
  {
    icon: Heart,
    title: 'عناية شخصية',
    description: 'استشارات مجانية لاختيار المنتج المناسب',
    color: 'from-primary to-accent',
  },
  {
    icon: Leaf,
    title: 'مكونات طبيعية',
    description: 'منتجات بمكونات طبيعية وآمنة للاستخدام اليومي',
    color: 'from-primary/80 to-primary-light',
  },
  {
    icon: HeartHandshake,
    title: 'دعم مستمر',
    description: 'فريق دعم جاهز لخدمتك على مدار الساعة',
    color: 'from-accent to-primary',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            لماذا تختار لمسة بيوتي؟
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            نقدم لك أفضل تجربة تسوق مع منتجات جمال فاخرة عالية الجودة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-2xl bg-card border border-border p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity rounded-full -mr-16 -mt-16 blur-2xl"></div>
              
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-0.5 mb-6`}>
                <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-3 text-primary group-hover:text-accent transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
