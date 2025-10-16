import { MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

export const WhatsAppButton = () => {
  const location = useLocation();
  
  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const { data: settings } = useQuery({
    queryKey: ['whatsapp-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_settings')
        .select('whatsapp_number')
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (!settings?.whatsapp_number) {
    return null;
  }

  const handleClick = () => {
    const message = encodeURIComponent('مرحباً، أريد الاستفسار عن المنتجات');
    const whatsappUrl = `https://wa.me/${settings.whatsapp_number}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
      aria-label="تواصل معنا عبر واتساب"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute right-full mr-3 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        تواصل معنا
      </span>
    </button>
  );
};
