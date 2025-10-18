import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Tag, Truck, Leaf, Headphones, Sparkles, ShieldCheck, Gift, Percent, X } from 'lucide-react';

interface PromoMessage {
  text: string;
  icon: string;
}

const iconMap = {
  tag: Tag,
  truck: Truck,
  leaf: Leaf,
  headphones: Headphones,
  sparkles: Sparkles,
  'shield-check': ShieldCheck,
  gift: Gift,
  percent: Percent,
};

const STORAGE_KEY = 'promo-banner-closed';

export const PromoBanner = () => {
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const closed = localStorage.getItem(STORAGE_KEY);
    if (closed === 'true') {
      setIsClosed(true);
    }
  }, []);

  const { data: publicSettings } = useQuery({
    queryKey: ['public-settings-promo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_settings')
        .select('promo_messages')
        .single();
      if (error) throw error;
      return data;
    },
  });

  const promoMessages: PromoMessage[] = (publicSettings?.promo_messages as unknown as PromoMessage[]) || [
    { text: 'عرض خاص: خصم 20% على جميع المنتجات', icon: 'tag' },
    { text: 'شحن مجاني لجميع الطلبات', icon: 'truck' },
    { text: 'منتجات طبيعية 100%', icon: 'leaf' },
    { text: 'دعم فني متاح 24/7', icon: 'headphones' },
  ];

  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true,
      direction: 'rtl',
      align: 'center'
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const handleClose = () => {
    setIsClosed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (isClosed) return null;

  return (
    <div className="relative bg-primary text-primary-foreground py-3 overflow-hidden">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {promoMessages.map((message, index) => {
            const IconComponent = iconMap[message.icon as keyof typeof iconMap] || Sparkles;
            return (
              <div key={index} className="embla__slide flex-[0_0_100%] min-w-0">
                <div className="flex items-center justify-center gap-2 px-4">
                  <IconComponent className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm md:text-base font-medium text-center">
                    {message.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <button
        onClick={handleClose}
        className="absolute left-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
        aria-label="إغلاق"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
