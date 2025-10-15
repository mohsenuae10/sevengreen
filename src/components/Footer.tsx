import { Facebook, Instagram, Phone, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const Footer = () => {
  const { data: settings } = useQuery({
    queryKey: ['site-settings-footer'],
    queryFn: async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('store_name, store_phone, store_email, facebook_url, instagram_url, whatsapp_number')
        .single();
      return data;
    },
  });

  return (
    <footer className="border-t bg-secondary/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-primary mb-3">
              {settings?.store_name || 'Seven Green'}
            </h3>
            <p className="text-sm text-muted-foreground">
              منتجات العناية الطبيعية - صوابين، شامبو، ومنتجات التجميل
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-primary mb-3">روابط سريعة</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-muted-foreground hover:text-primary transition-colors">
                  الرئيسية
                </a>
              </li>
              <li>
                <a href="/products" className="text-muted-foreground hover:text-primary transition-colors">
                  المنتجات
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-primary mb-3">تواصل معنا</h3>
            <div className="flex gap-4">
              {settings?.facebook_url && (
                <a 
                  href={settings.facebook_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings?.instagram_url && (
                <a 
                  href={settings.instagram_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings?.store_phone && (
                <a 
                  href={`tel:${settings.store_phone}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="h-5 w-5" />
                </a>
              )}
              {settings?.store_email && (
                <a 
                  href={`mailto:${settings.store_email}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>© 2025 {settings?.store_name || 'Seven Green'}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};
