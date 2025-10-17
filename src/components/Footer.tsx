import { Facebook, Instagram, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { NewsletterForm } from '@/components/NewsletterForm';
import { Separator } from '@/components/ui/separator';

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

  const { data: categories } = useQuery({
    queryKey: ['product-categories'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('category')
        .eq('is_active', true);
      
      if (!data) return [];
      
      // Get unique categories
      const uniqueCategories = [...new Set(data.map(p => p.category))];
      return uniqueCategories.slice(0, 6); // Show max 6 categories
    },
  });

  return (
    <footer className="border-t bg-secondary/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Store Info + Newsletter */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-primary mb-2">
                {settings?.store_name || 'Seven Green'}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                متجرك المتخصص في منتجات العناية الطبيعية - صوابين، شامبو، ومنتجات التجميل الطبيعية 100%
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-3 text-primary">النشرة البريدية</h4>
              <NewsletterForm />
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">روابط سريعة</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  المنتجات
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  اتصل بنا
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  الأسئلة الشائعة
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Product Categories */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">فئات المنتجات</h3>
            <ul className="space-y-3 text-sm">
              {categories && categories.length > 0 ? (
                categories.map((category, index) => (
                  <li key={index}>
                    <Link 
                      to={`/products?category=${encodeURIComponent(category)}`}
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <span className="w-1 h-1 bg-primary rounded-full"></span>
                      {category}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground text-sm">جاري التحميل...</li>
              )}
              <li>
                <Link 
                  to="/products"
                  className="text-primary hover:underline transition-colors flex items-center gap-2 font-medium"
                >
                  عرض جميع المنتجات ←
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Policies + Payment Methods + Social */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-primary mb-4">السياسات</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    سياسة الخصوصية
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    شروط الخدمة
                  </Link>
                </li>
                <li>
                  <Link to="/return-policy" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    سياسة الإرجاع
                  </Link>
                </li>
                <li>
                  <Link to="/shipping-policy" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    سياسة الشحن
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 text-primary">تواصل معنا</h4>
              <div className="flex gap-3">
                {settings?.facebook_url && (
                  <a 
                    href={settings.facebook_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-primary/10 hover:bg-primary hover:text-primary-foreground p-2.5 rounded-full transition-all"
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
                    className="bg-primary/10 hover:bg-primary hover:text-primary-foreground p-2.5 rounded-full transition-all"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 text-primary">طرق الدفع</h4>
              <div className="flex gap-2 flex-wrap items-center">
                <div className="bg-background border rounded-md p-2 h-12 flex items-center justify-center min-w-[60px]">
                  <img src="/images/payment-icons/mada.svg" alt="مدى" className="h-8 w-auto object-contain" />
                </div>
                <div className="bg-background border rounded-md p-2 h-12 flex items-center justify-center min-w-[60px]">
                  <img src="/images/payment-icons/visa.svg" alt="Visa" className="h-8 w-auto object-contain" />
                </div>
                <div className="bg-background border rounded-md p-2 h-12 flex items-center justify-center min-w-[60px]">
                  <img src="/images/payment-icons/mastercard.svg" alt="Mastercard" className="h-8 w-auto object-contain" />
                </div>
                <div className="bg-background border rounded-md p-2 h-12 flex items-center justify-center min-w-[60px]">
                  <img src="/images/payment-icons/apple-pay.svg" alt="Apple Pay" className="h-8 w-auto object-contain" />
                </div>
                <div className="bg-background border rounded-md p-2 h-12 flex items-center justify-center min-w-[60px]">
                  <img src="/images/payment-icons/google-pay.svg" alt="Google Pay" className="h-8 w-auto object-contain" />
                </div>
                <div className="bg-background border rounded-md p-2 h-12 flex items-center justify-center min-w-[60px]">
                  <img src="/images/payment-icons/american-express.svg" alt="American Express" className="h-8 w-auto object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {settings?.store_name || 'Seven Green'}. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};
