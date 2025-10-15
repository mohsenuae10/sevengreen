import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: order } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      setStatus(data.status as OrderStatus);
      setTrackingNumber(data.tracking_number || '');
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('orders')
        .update({ status, tracking_number: trackingNumber })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
      toast({ title: 'تم تحديث الطلب بنجاح' });
    },
  });

  const sendTrackingEmail = async () => {
    const { error } = await supabase.functions.invoke('send-tracking-email', {
      body: { order_id: id, tracking_number: trackingNumber },
    });
    if (error) {
      toast({ title: 'خطأ في إرسال البريد', variant: 'destructive' });
    } else {
      toast({ title: 'تم إرسال رقم التتبع للعميل' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">تفاصيل الطلب: {order?.order_number}</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>معلومات العميل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>الاسم:</strong> {order?.customer_name}</p>
              <p><strong>البريد:</strong> {order?.customer_email}</p>
              <p><strong>الهاتف:</strong> {order?.customer_phone}</p>
              <p><strong>المدينة:</strong> {order?.city}</p>
              <p><strong>العنوان:</strong> {order?.shipping_address}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إدارة الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>حالة الطلب</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="processing">قيد المعالجة</SelectItem>
                    <SelectItem value="shipped">تم الشحن</SelectItem>
                    <SelectItem value="delivered">تم التوصيل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>رقم التتبع</Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="أدخل رقم التتبع"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => updateMutation.mutate()}>
                  حفظ التغييرات
                </Button>
                {trackingNumber && (
                  <Button variant="outline" onClick={sendTrackingEmail}>
                    إرسال رقم التتبع
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order?.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">الكمية: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{item.total_price} ريال</p>
                </div>
              ))}
              <div className="flex justify-between pt-4 border-t-2">
                <p className="font-bold">المجموع الكلي</p>
                <p className="font-bold text-lg">{order?.total_amount} ريال</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
