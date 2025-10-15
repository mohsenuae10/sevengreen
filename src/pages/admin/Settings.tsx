import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

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

  const [formData, setFormData] = useState({
    store_name: settings?.store_name || '',
    store_email: settings?.store_email || '',
    store_phone: settings?.store_phone || '',
    whatsapp_number: settings?.whatsapp_number || '',
    facebook_url: settings?.facebook_url || '',
    instagram_url: settings?.instagram_url || '',
    default_shipping_fee: settings?.default_shipping_fee || 0,
    currency: settings?.currency || 'ريال',
    seo_home_title: settings?.seo_home_title || '',
    seo_home_description: settings?.seo_home_description || '',
    store_domain: settings?.store_domain || '',
    store_url: settings?.store_url || '',
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('site_settings')
        .update(formData)
        .eq('id', settings?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({ title: 'تم حفظ الإعدادات بنجاح' });
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">الإعدادات</h1>

        <Card>
          <CardHeader>
            <CardTitle>معلومات المتجر</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اسم المتجر</Label>
                <Input
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>العملة</Label>
                <Input
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>النطاق (Domain)</Label>
                <Input
                  value={formData.store_domain}
                  onChange={(e) => setFormData({ ...formData, store_domain: e.target.value })}
                  placeholder="sevengreenstore.com"
                />
              </div>
              <div className="space-y-2">
                <Label>رابط المتجر الكامل</Label>
                <Input
                  value={formData.store_url}
                  onChange={(e) => setFormData({ ...formData, store_url: e.target.value })}
                  placeholder="https://sevengreenstore.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={formData.store_email}
                  onChange={(e) => setFormData({ ...formData, store_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input
                  value={formData.store_phone}
                  onChange={(e) => setFormData({ ...formData, store_phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>رسوم الشحن الافتراضية (ريال)</Label>
              <Input
                type="number"
                value={formData.default_shipping_fee}
                onChange={(e) => setFormData({ ...formData, default_shipping_fee: parseFloat(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>وسائل التواصل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>رقم الواتساب</Label>
              <Input
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>رابط Facebook</Label>
              <Input
                value={formData.facebook_url}
                onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>رابط Instagram</Label>
              <Input
                value={formData.instagram_url}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>إعدادات SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>عنوان الصفحة الرئيسية</Label>
              <Input
                value={formData.seo_home_title}
                onChange={(e) => setFormData({ ...formData, seo_home_title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>وصف الصفحة الرئيسية</Label>
              <Textarea
                value={formData.seo_home_description}
                onChange={(e) => setFormData({ ...formData, seo_home_description: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={() => updateMutation.mutate()} size="lg">
          حفظ جميع الإعدادات
        </Button>
      </div>
    </AdminLayout>
  );
}
