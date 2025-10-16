import { Facebook, Instagram } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const { data: settings } = useQuery({
    queryKey: ['public-settings-footer'],
    queryFn: async () => {
      const { data } = await supabase
        .from('public_settings')
        .select('store_name, facebook_url, instagram_url, whatsapp_number')
        .single();
      return data;
    },
  });

  return (
    <footer className="border-t bg-secondary/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  الأسئلة الشائعة
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-primary mb-3">السياسات</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">
                  شروط الخدمة
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="text-muted-foreground hover:text-primary transition-colors">
                  سياسة الإرجاع
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="text-muted-foreground hover:text-primary transition-colors">
                  سياسة الشحن
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-primary mb-3">تواصل معنا</h3>
            <div className="flex gap-4 mb-4">
              {settings?.facebook_url && (
                <a 
                  href={settings.facebook_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Facebook"
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
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">طرق الدفع المتاحة:</p>
              <div className="flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-secondary rounded text-xs">Mada</span>
                <span className="px-2 py-1 bg-secondary rounded text-xs">Visa</span>
                <span className="px-2 py-1 bg-secondary rounded text-xs">Mastercard</span>
                <span className="px-2 py-1 bg-secondary rounded text-xs">Apple Pay</span>
              </div>
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
