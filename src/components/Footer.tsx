import { Facebook, Instagram, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NewsletterForm } from '@/components/NewsletterForm';
import { Separator } from '@/components/ui/separator';
import logoImg from '@/assets/logo.png';
const logo = typeof logoImg === 'string' ? logoImg : logoImg.src;
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';
import LocalizedLink from './LocalizedLink';

export const Footer = () => {
  const { t, language, getLocalizedField } = useLanguageCurrency();
  
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
    queryKey: ['footer-categories', language],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .limit(6);
      
      return data || [];
    },
  });

  const storeName = language === 'ar' 
    ? (settings?.store_name || 'لمسة بيوتي') 
    : 'Lamset Beauty';

  return (
    <footer className="border-t bg-secondary/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Store Info + Newsletter */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img src={logo} alt="لمسة بيوتي | Lamset Beauty" className="h-20 w-20 object-contain" />
                <h3 className="text-xl font-bold text-primary">
                  {storeName}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('footer.storeDescription')}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-3 text-primary">{t('footer.newsletter')}</h4>
              <NewsletterForm />
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <LocalizedLink to="/" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  {t('nav.home')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink to="/products" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  {t('nav.products')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink to="/about" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  {t('nav.about')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink to="/contact" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  {t('nav.contact')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink to="/faq" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  {t('nav.faq')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink to="/blog" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  {t('nav.blog')}
                </LocalizedLink>
              </li>
            </ul>
          </div>

          {/* Column 3: Product Categories */}
          <div>
            <h3 className="text-lg font-bold text-primary mb-4">{t('footer.productCategories')}</h3>
            <ul className="space-y-3 text-sm">
              {categories && categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.slug}>
                    <LocalizedLink 
                      to={`/products?category=${encodeURIComponent(category.slug)}`}
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <span className="w-1 h-1 bg-primary rounded-full" aria-hidden="true"></span>
                      {getLocalizedField(category, 'name')}
                    </LocalizedLink>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground text-sm">{t('common.loading')}</li>
              )}
              <li>
                <LocalizedLink 
                  to="/products"
                  className="text-primary hover:underline transition-colors flex items-center gap-2 font-medium"
                >
                  {t('nav.allProducts')} {language === 'ar' ? '←' : '→'}
                </LocalizedLink>
              </li>
            </ul>
          </div>

          {/* Column 4: Policies + Payment Methods + Social */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-primary mb-4">{t('footer.policies')}</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <LocalizedLink to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    {t('nav.privacyPolicy')}
                  </LocalizedLink>
                </li>
                <li>
                  <LocalizedLink to="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    {t('nav.termsOfService')}
                  </LocalizedLink>
                </li>
                <li>
                  <LocalizedLink to="/return-policy" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    {t('nav.returnPolicy')}
                  </LocalizedLink>
                </li>
                <li>
                  <LocalizedLink to="/shipping-policy" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full"></span>
                    {t('nav.shippingPolicy')}
                  </LocalizedLink>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3 text-primary">{t('footer.paymentMethods')}</h4>
              <div className="flex gap-2 flex-wrap items-center">
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

            <div>
              <h4 className="text-sm font-semibold mb-3 text-primary">{t('footer.contactUs')}</h4>
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

          </div>
        </div>

        <Separator className="my-8" />

        <div className="text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {storeName}. {t('footer.copyright')}.</p>
        </div>
      </div>
    </footer>
  );
};
