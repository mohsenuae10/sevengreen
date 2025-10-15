import { Leaf, Sparkles, Heart, Truck, Shield, HeartHandshake } from 'lucide-react';

const features = [
  {
    icon: Leaf,
    title: 'طبيعي 100%',
    description: 'جميع منتجاتنا طبيعية وآمنة للاستخدام اليومي',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: Sparkles,
    title: 'جودة عالية',
    description: 'منتجات مختارة بعناية لضمان أفضل النتائج',
    color: 'from-amber-500 to-yellow-600',
  },
  {
    icon: Heart,
    title: 'عناية فائقة',
    description: 'نهتم براحتك ورضاك عن منتجاتنا',
    color: 'from-rose-500 to-pink-600',
  },
  {
    icon: Truck,
    title: 'شحن سريع',
    description: 'توصيل سريع وآمن لجميع المحافظات',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: Shield,
    title: 'ضمان الجودة',
    description: 'منتجات أصلية ومضمونة 100%',
    color: 'from-purple-500 to-violet-600',
  },
  {
    icon: HeartHandshake,
    title: 'دعم مستمر',
    description: 'فريق دعم جاهز لخدمتك على مدار الساعة',
    color: 'from-orange-500 to-red-600',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            لماذا تختار Seven Green؟
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            نقدم لك أفضل تجربة تسوق مع منتجات طبيعية عالية الجودة
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
