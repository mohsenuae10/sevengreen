import { Shield, Truck, RotateCcw, Leaf } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    {
      icon: Leaf,
      title: 'منتجات طبيعية',
      description: '100% طبيعي',
    },
    {
      icon: Shield,
      title: 'جودة مضمونة',
      description: 'منتجات أصلية',
    },
    {
      icon: Truck,
      title: 'توصيل سريع',
      description: 'شحن لجميع المدن',
    },
    {
      icon: RotateCcw,
      title: 'إرجاع مجاني',
      description: 'خلال 14 يوم',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-secondary/30 rounded-lg border border-border">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div key={index} className="flex flex-col items-center text-center gap-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{badge.title}</p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
