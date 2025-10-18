import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PromotionalBanner } from "@/components/PromotionalBanner";
import Home from "@/pages/Home";

const Index = () => {
  const { data: activeBanners, isLoading } = useQuery({
    queryKey: ['promotional-banners-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotional_banners')
        .select('id, banner_image_url, offer_description, product_id')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching promotional banners:', error);
        throw error;
      }
      
      console.log('Promotional banners fetched:', data);
      return data;
    },
  });

  console.log('Active banners:', activeBanners);

  return (
    <>
      {!isLoading && activeBanners && activeBanners.length > 0 && (
        <div className="w-full">
          {activeBanners.map((banner) => (
            <PromotionalBanner
              key={banner.id}
              bannerUrl={banner.banner_image_url || ''}
              productId={banner.product_id}
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
