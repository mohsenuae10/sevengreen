import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: publicSettings } = useQuery({
    queryKey: ['public-settings-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_settings')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
  });

  const [publicFormData, setPublicFormData] = useState({
    store_name: '',
    facebook_url: '',
    instagram_url: '',
    whatsapp_number: '',
    seo_home_title: '',
    seo_home_description: '',
    store_domain: '',
    store_url: '',
    currency: 'ريال',
    store_logo_url: '',
    promo_messages: [] as { text: string; icon: string }[],
  });

  const [privateFormData, setPrivateFormData] = useState({
    store_email: '',
    store_phone: '',
    default_shipping_fee: 0,
  });

  useEffect(() => {
    if (publicSettings) {
      setPublicFormData({
        store_name: publicSettings.store_name || '',
        facebook_url: publicSettings.facebook_url || '',
        instagram_url: publicSettings.instagram_url || '',
        whatsapp_number: publicSettings.whatsapp_number || '',
        seo_home_title: publicSettings.seo_home_title || '',
        seo_home_description: publicSettings.seo_home_description || '',
        store_domain: publicSettings.store_domain || '',
        store_url: publicSettings.store_url || '',
        currency: publicSettings.currency || 'ريال',
        store_logo_url: publicSettings.store_logo_url || '',
        promo_messages: (publicSettings.promo_messages as unknown as { text: string; icon: string }[]) || [],
      });
    }
  }, [publicSettings]);

  useEffect(() => {
    if (settings) {
      setPrivateFormData({
        store_email: settings.store_email || '',
        store_phone: settings.store_phone || '',
        default_shipping_fee: settings.default_shipping_fee || 0,
      });
    }
  }, [settings]);

  const updatePublicMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('public_settings')
        .update(publicFormData)
        .eq('id', publicSettings?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-settings-admin'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings-footer'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings-promo'] });
      toast({ title: 'تم حفظ الإعدادات العامة بنجاح' });
    },
  });

  const availableIcons = [
    { value: 'tag', label: 'عرض/تاج' },
    { value: 'truck', label: 'شحن' },
    { value: 'leaf', label: 'طبيعي' },
    { value: 'headphones', label: 'دعم فني' },
    { value: 'sparkles', label: 'جديد' },
    { value: 'shield-check', label: 'ضمان' },
    { value: 'gift', label: 'هدية' },
    { value: 'percent', label: 'نسبة مئوية' },
  ];

  const addPromoMessage = () => {
    setPublicFormData({
      ...publicFormData,
      promo_messages: [...publicFormData.promo_messages, { text: '', icon: 'tag' }],
    });
  };

  const removePromoMessage = (index: number) => {
    const newMessages = publicFormData.promo_messages.filter((_, i) => i !== index);
    setPublicFormData({ ...publicFormData, promo_messages: newMessages });
  };

  const updatePromoMessage = (index: number, field: 'text' | 'icon', value: string) => {
    const newMessages = [...publicFormData.promo_messages];
    newMessages[index] = { ...newMessages[index], [field]: value };
    setPublicFormData({ ...publicFormData, promo_messages: newMessages });
  };

  const updatePrivateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('site_settings')
        .update(privateFormData)
        .eq('id', settings?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({ title: 'تم حفظ الإعدادات الخاصة بنجاح' });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">الإعدادات</h1>

        <Card>
          <CardHeader>
            <CardTitle>الإعدادات العامة (متاحة للجميع)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="store_name">اسم المتجر</Label>
              <Input
                id="store_name"
                value={publicFormData.store_name}
                onChange={(e) => setPublicFormData({ ...publicFormData, store_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="store_url">رابط المتجر</Label>
              <Input
                id="store_url"
                value={publicFormData.store_url}
                onChange={(e) => setPublicFormData({ ...publicFormData, store_url: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="store_domain">نطاق المتجر</Label>
              <Input
                id="store_domain"
                value={publicFormData.store_domain}
                onChange={(e) => setPublicFormData({ ...publicFormData, store_domain: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="currency">العملة</Label>
              <Input
                id="currency"
                value={publicFormData.currency}
                onChange={(e) => setPublicFormData({ ...publicFormData, currency: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="facebook_url">رابط فيسبوك</Label>
              <Input
                id="facebook_url"
                value={publicFormData.facebook_url}
                onChange={(e) => setPublicFormData({ ...publicFormData, facebook_url: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="instagram_url">رابط إنستغرام</Label>
              <Input
                id="instagram_url"
                value={publicFormData.instagram_url}
                onChange={(e) => setPublicFormData({ ...publicFormData, instagram_url: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="whatsapp_number">رقم واتساب</Label>
              <Input
                id="whatsapp_number"
                value={publicFormData.whatsapp_number}
                onChange={(e) => setPublicFormData({ ...publicFormData, whatsapp_number: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="seo_home_title">عنوان SEO للصفحة الرئيسية</Label>
              <Input
                id="seo_home_title"
                value={publicFormData.seo_home_title}
                onChange={(e) => setPublicFormData({ ...publicFormData, seo_home_title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="seo_home_description">وصف SEO للصفحة الرئيسية</Label>
              <Textarea
                id="seo_home_description"
                value={publicFormData.seo_home_description}
                onChange={(e) => setPublicFormData({ ...publicFormData, seo_home_description: e.target.value })}
              />
            </div>

            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">رسائل الشريط الترويجي</Label>
                <Button
                  type="button"
                  onClick={addPromoMessage}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  إضافة رسالة
                </Button>
              </div>

              <div className="space-y-3">
                {publicFormData.promo_messages.map((message, index) => (
                  <div key={index} className="flex gap-2 items-start p-3 bg-muted/50 rounded-lg">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-2 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="نص الرسالة"
                        value={message.text}
                        onChange={(e) => updatePromoMessage(index, 'text', e.target.value)}
                      />
                      <Select
                        value={message.icon}
                        onValueChange={(value) => updatePromoMessage(index, 'icon', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الأيقونة" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableIcons.map((icon) => (
                            <SelectItem key={icon.value} value={icon.value}>
                              {icon.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      onClick={() => removePromoMessage(index)}
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive mt-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {publicFormData.promo_messages.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  لا توجد رسائل ترويجية. اضغط "إضافة رسالة" للبدء.
                </p>
              )}
            </div>

            <Button 
              onClick={() => updatePublicMutation.mutate()}
              disabled={updatePublicMutation.isPending}
              className="w-full"
            >
              {updatePublicMutation.isPending ? 'جاري الحفظ...' : 'حفظ الإعدادات العامة'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الإعدادات الخاصة (للمسؤولين فقط)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="store_email">البريد الإلكتروني</Label>
              <Input
                id="store_email"
                type="email"
                value={privateFormData.store_email}
                onChange={(e) => setPrivateFormData({ ...privateFormData, store_email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="store_phone">رقم الهاتف</Label>
              <Input
                id="store_phone"
                value={privateFormData.store_phone}
                onChange={(e) => setPrivateFormData({ ...privateFormData, store_phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="default_shipping_fee">رسوم الشحن الافتراضية</Label>
              <Input
                id="default_shipping_fee"
                type="number"
                value={privateFormData.default_shipping_fee}
                onChange={(e) => setPrivateFormData({ ...privateFormData, default_shipping_fee: Number(e.target.value) })}
              />
            </div>
            <Button 
              onClick={() => updatePrivateMutation.mutate()}
              disabled={updatePrivateMutation.isPending}
              className="w-full"
            >
              {updatePrivateMutation.isPending ? 'جاري الحفظ...' : 'حفظ الإعدادات الخاصة'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
