import { useState } from 'react';
import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MapPin, MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';

export default function Contact() {
  const { toast } = useToast();
  const { t, getLocalizedPath } = useLanguageCurrency();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactSchema = z.object({
    name: z.string().trim().min(1, { message: t('contact.nameRequired') }).max(100, { message: t('contact.nameTooLong') }),
    email: z.string().trim().email({ message: t('contact.invalidEmail') }).max(255, { message: t('contact.emailTooLong') }),
    phone: z.string().trim().min(10, { message: t('contact.phoneTooShort') }).max(15, { message: t('contact.phoneTooLong') }),
    message: z.string().trim().min(10, { message: t('contact.messageTooShort') }).max(1000, { message: t('contact.messageTooLong') })
  });

  const { data: settings } = useQuery({
    queryKey: ['public-settings-contact'],
    queryFn: async () => {
      const { data } = await supabase
        .from('public_settings')
        .select('whatsapp_number, facebook_url, instagram_url')
        .single();
      return data;
    },
  });

  const breadcrumbs = [
    { name: t('nav.home'), url: getLocalizedPath('/') },
    { name: t('nav.contact'), url: getLocalizedPath('/contact') }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = contactSchema.safeParse(formData);
    
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          newErrors[error.path[0].toString()] = error.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const whatsappNumber = settings?.whatsapp_number || '';
      const message = `${encodeURIComponent(formData.name)}\n\n${t('contact.email')}: ${encodeURIComponent(formData.email)}\n${t('contact.phone')}: ${encodeURIComponent(formData.phone)}\n\n${t('contact.message')}:\n${encodeURIComponent(formData.message)}`;
      
      if (whatsappNumber) {
        window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
      }

      toast({
        title: t('contact.messageSent'),
        description: t('contact.messageSentDesc'),
      });

      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast({
        title: t('contact.errorOccurred'),
        description: t('contact.tryAgain'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title={t('contact.title')}
        description={t('contact.description')}
        keywords={t('contact.seoKeywords')}
        url={`https://lamsetbeauty.com${getLocalizedPath('/contact')}`}
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbs} />
      
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-4xl font-bold text-center mb-4 text-primary">
                {t('nav.contact')}
              </h1>
              <p className="text-center text-lg text-muted-foreground mb-12">
                {t('contact.subtitle')}
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('contact.contactInfo')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {settings?.whatsapp_number && (
                        <div className="flex items-start gap-3">
                          <MessageCircle className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <p className="font-medium">{t('contact.whatsapp')}</p>
                            <a 
                              href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary"
                            >
                              {settings.whatsapp_number}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <p className="font-medium">{t('contact.location')}</p>
                          <p className="text-muted-foreground">{t('contact.locationValue')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t('contact.workingHours')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{t('contact.satToThu')}</span>
                          <span className="text-muted-foreground">{t('contact.satToThuHours')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">{t('contact.friday')}</span>
                          <span className="text-muted-foreground">{t('contact.holiday')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('contact.sendMessage')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">{t('contact.name')} *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={errors.name ? 'border-destructive' : ''}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive mt-1">{errors.name}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">{t('contact.email')} *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={errors.email ? 'border-destructive' : ''}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phone">{t('contact.phone')} *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={errors.phone ? 'border-destructive' : ''}
                        />
                        {errors.phone && (
                          <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="message">{t('contact.message')} *</Label>
                        <Textarea
                          id="message"
                          rows={5}
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className={errors.message ? 'border-destructive' : ''}
                        />
                        {errors.message && (
                          <p className="text-sm text-destructive mt-1">{errors.message}</p>
                        )}
                      </div>

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? t('contact.sending') : t('contact.send')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}