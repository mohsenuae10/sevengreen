import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PromotionalBanner } from "@/components/PromotionalBanner";
import Home from "@/pages/Home";

const Index = () => {
  const { data: activeBanners } = useQuery({
    queryKey: ['promotional-banners-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotional_banners')
        .select('*, products(slug)')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      {activeBanners && activeBanners.length > 0 && (
        <div className="w-full">
          {activeBanners.map((banner) => (
            <PromotionalBanner
              key={banner.id}
              bannerUrl={banner.banner_image_url || ''}
              productSlug={banner.products?.slug || ''}
              offerDescription={banner.offer_description}
            />
          ))}
        </div>
      )}
      <Home />
    </>
  );
};

export default Index;
