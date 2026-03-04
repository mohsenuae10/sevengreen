import { Shield, Truck, RotateCcw, Leaf } from 'lucide-react';
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';

export default function TrustBadges() {
  const { t } = useLanguageCurrency();

  const badges = [
    {
      icon: Leaf,
      title: t('trustBadges.natural'),
      description: t('trustBadges.naturalDesc'),
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
    },
    {
      icon: Shield,
      title: t('trustBadges.genuine'),
      description: t('trustBadges.genuineDesc'),
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
    },
    {
      icon: Truck,
      title: t('trustBadges.fastShipping'),
      description: t('trustBadges.fastShippingDesc'),
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
    },
    {
      icon: RotateCcw,
      title: t('trustBadges.freeReturn'),
      description: t('trustBadges.freeReturnDesc'),
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div 
            key={index} 
            className={`flex flex-col items-center text-center gap-3 p-5 rounded-xl bg-gradient-to-br ${badge.bgGradient} border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-soft hover:-translate-y-1`}
          >
            <div className={`p-3 rounded-xl bg-gradient-to-br ${badge.gradient} shadow-md`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm mb-1">{badge.title}</p>
              <p className="text-xs text-muted-foreground font-medium">{badge.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
