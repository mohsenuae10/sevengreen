import { useState } from 'react';
import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, { message: "الاسم مطلوب" }).max(100, { message: "الاسم يجب أن يكون أقل من 100 حرف" }),
  email: z.string().trim().email({ message: "البريد الإلكتروني غير صحيح" }).max(255, { message: "البريد الإلكتروني يجب أن يكون أقل من 255 حرف" }),
  phone: z.string().trim().min(10, { message: "رقم الهاتف يجب أن يكون 10 أرقام على الأقل" }).max(15, { message: "رقم الهاتف يجب أن يكون أقل من 15 رقم" }),
  message: z.string().trim().min(10, { message: "الرسالة يجب أن تكون 10 أحرف على الأقل" }).max(1000, { message: "الرسالة يجب أن تكون أقل من 1000 حرف" })
});

export default function Contact() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    { name: 'الرئيسية', url: '/' },
    { name: 'اتصل بنا', url: '/contact' }
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
      const message = `مرحباً، أنا ${encodeURIComponent(formData.name)}\n\nالبريد الإلكتروني: ${encodeURIComponent(formData.email)}\nالهاتف: ${encodeURIComponent(formData.phone)}\n\nالرسالة:\n${encodeURIComponent(formData.message)}`;
      
      if (whatsappNumber) {
        window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
      }

      toast({
        title: 'تم إرسال رسالتك بنجاح',
        description: 'سنتواصل معك في أقرب وقت ممكن',
      });

      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast({
        title: 'حدث خطأ',
        description: 'يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead
        title="اتصل بنا - لمسة بيوتي | Lamset Beauty"
        description="تواصلي مع فريق لمسة بيوتي. نحن هنا للإجابة على استفساراتك حول منتجاتنا والإجابة على جميع أسئلتك."
        keywords="اتصل بنا, تواصل معنا, خدمة العملاء, لمسة بيوتي"
        url="/contact"
        type="website"
      />
      <BreadcrumbSchema items={breadcrumbs} />
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-4xl font-bold text-center mb-4 text-primary">
                اتصل بنا
              </h1>
              <p className="text-center text-lg text-muted-foreground mb-12">
                نحن هنا للإجابة على جميع استفساراتك
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>معلومات التواصل</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {settings?.whatsapp_number && (
                        <div className="flex items-start gap-3">
                          <MessageCircle className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <p className="font-medium">واتساب</p>
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
                          <p className="font-medium">الموقع</p>
                          <p className="text-muted-foreground">المملكة العربية السعودية</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>ساعات العمل</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">السبت - الخميس</span>
                          <span className="text-muted-foreground">9:00 ص - 9:00 م</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">الجمعة</span>
                          <span className="text-muted-foreground">عطلة</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>أرسل لنا رسالة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">الاسم *</Label>
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
                        <Label htmlFor="email">البريد الإلكتروني *</Label>
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
                        <Label htmlFor="phone">رقم الهاتف *</Label>
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
                        <Label htmlFor="message">رسالتك *</Label>
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
                        {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
