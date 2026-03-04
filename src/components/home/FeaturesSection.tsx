import { Leaf, Sparkles, Heart, Truck, Shield, HeartHandshake } from 'lucide-react';
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';

export const FeaturesSection = () => {
  const { t } = useLanguageCurrency();

  const features = [
    {
      icon: Sparkles,
      title: t('features.luxury'),
      description: t('features.luxuryDesc'),
    },
    {
      icon: Shield,
      title: t('features.original'),
      description: t('features.originalDesc'),
    },
    {
      icon: Truck,
      title: t('features.fastDelivery'),
      description: t('features.fastDeliveryDesc'),
    },
    {
      icon: Heart,
      title: t('features.personalCare'),
      description: t('features.personalCareDesc'),
    },
    {
      icon: Leaf,
      title: t('features.naturalIngredients'),
      description: t('features.naturalIngredientsDesc'),
    },
    {
      icon: HeartHandshake,
      title: t('features.support'),
      description: t('features.supportDesc'),
    },
  ];

  return (
    <section className="py-16 bg-white relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            {t('home.whyChooseUs')}
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-primary-light via-primary to-primary-dark rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            {t('home.whyChooseUsDesc')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group text-center p-5 md:p-6 rounded-2xl bg-secondary/40 hover:bg-secondary/70 border border-transparent hover:border-primary/10 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/15 transition-colors duration-300">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              
              <h3 className="text-sm md:text-base font-bold mb-1.5 text-foreground">
                {feature.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
