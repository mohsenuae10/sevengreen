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
import { toast } from 'sonner';
import { OrderTimeline } from '@/components/admin/OrderTimeline';
import { QuickActionsPanel } from '@/components/admin/QuickActionsPanel';
import { ShippingModal } from '@/components/admin/ShippingModal';
import { User, Mail, Phone, MapPin, Package, DollarSign, Calendar, Loader2 } from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
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
    mutationFn: async (updates: { status?: OrderStatus; tracking_number?: string; shipping_company?: string }) => {
      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      return updates;
    },
    onSuccess: async (updates) => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('تم تحديث الطلب بنجاح');
      
      // إرسال إيميل الشحن تلقائياً عند تغيير الحالة إلى "تم الشحن"
      if (updates.status === 'shipped' && trackingNumber) {
        const { error } = await supabase.functions.invoke('send-tracking-email', {
          body: { order_id: id, tracking_number: trackingNumber },
        });
        if (error) {
          toast.error('تم تحديث الطلب لكن فشل إرسال البريد');
        } else {
          toast.success('تم إرسال إشعار الشحن للعميل');
        }
      }
    },
    onError: () => {
      toast.error('حدث خطأ أثناء تحديث الطلب');
    }
  });

  const handleStatusChange = (newStatus: OrderStatus) => {
    setStatus(newStatus);
    updateMutation.mutate({ status: newStatus });
  };

  const handleShipOrder = () => {
    setShowShippingModal(true);
  };

  const handleShippingSubmit = async (data: { trackingNumber: string; company: string; sendEmail: boolean }) => {
    setTrackingNumber(data.trackingNumber);
    
    await updateMutation.mutateAsync({ 
      status: 'shipped',
      tracking_number: data.trackingNumber,
      shipping_company: data.company
    });

    if (data.sendEmail) {
      const { error } = await supabase.functions.invoke('send-tracking-email', {
        body: { order_id: id, tracking_number: data.trackingNumber },
      });
      if (error) {
        toast.error('تم تحديث الطلب لكن فشل إرسال البريد');
      } else {
        toast.success('تم شحن الطلب وإرسال إشعار للعميل');
      }
    }
    
    setShowShippingModal(false);
  };

  const sendPaymentReminder = async () => {
    setIsSendingReminder(true);
    try {
      const { error } = await supabase.functions.invoke('send-payment-reminder', {
        body: { order_id: id },
      });
      if (error) {
        toast.error('خطأ في إرسال التذكير');
      } else {
        toast.success('تم إرسال تذكير الدفع بنجاح');
      }
    } catch (error) {
      toast.error('خطأ في إرسال التذكير');
    } finally {
      setIsSendingReminder(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
            <p className="text-muted-foreground">جاري تحميل تفاصيل الطلب...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* العنوان */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              تفاصيل الطلب
            </h1>
            <p className="text-2xl font-bold text-foreground mt-2">
              {order?.order_number}
            </p>
          </div>
          <div className="text-left">
            <p className="text-sm text-muted-foreground">تاريخ الطلب</p>
            <p className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {order?.created_at && new Date(order.created_at).toLocaleDateString('ar-SA')}
            </p>
          </div>
        </div>

        {/* Timeline المرئي */}
        <Card className="group relative overflow-hidden border-2 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl transition-all duration-300">
          <CardContent className="pt-6">
            <OrderTimeline
              currentStatus={order?.status as OrderStatus}
              createdAt={order?.created_at}
              packedAt={order?.packed_at}
              shippedAt={order?.shipped_at}
              deliveredAt={order?.delivered_at}
              updatedAt={order?.updated_at}
            />
          </CardContent>
        </Card>

        {/* لوحة الإجراءات السريعة */}
        {order?.status !== 'delivered' && order?.status !== 'cancelled' && (
          <Card className="group relative overflow-hidden border-r-4 border-primary bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl transition-all duration-300">
            <CardContent className="pt-6">
              <QuickActionsPanel
                currentStatus={order?.status as OrderStatus}
                orderNumber={order?.order_number}
                onStatusChange={handleStatusChange}
                onShipOrder={handleShipOrder}
              />
            </CardContent>
          </Card>
        )}

        {/* معلومات العميل وإدارة الطلب */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* معلومات العميل */}
          <Card className="group relative overflow-hidden border-r-4 border-blue-500 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <User className="w-6 h-6 text-blue-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl">معلومات العميل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">الاسم</p>
                  <p className="font-semibold">{order?.customer_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-semibold">{order?.customer_email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                  <p className="font-semibold">{order?.customer_phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">المدينة</p>
                  <p className="font-semibold">{order?.city}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">العنوان</p>
                  <p className="font-semibold">{order?.shipping_address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* إدارة الطلب */}
          <Card className="group relative overflow-hidden border-r-4 border-purple-500 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <Package className="w-6 h-6 text-purple-500" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl">إدارة الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order?.payment_status === 'pending' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-600 text-xl">⚠️</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-amber-900 mb-1">الدفع معلق</h4>
                      <p className="text-sm text-amber-800 mb-3">
                        هذا الطلب لم يتم دفعه بعد. يمكنك إرسال تذكير للعميل لإكمال الدفع.
                      </p>
                      <Button 
                        onClick={sendPaymentReminder}
                        disabled={isSendingReminder}
                        className="bg-amber-600 hover:bg-amber-700"
                        size="sm"
                      >
                        {isSendingReminder ? (
                          <>
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                            جاري الإرسال...
                          </>
                        ) : (
                          <>
                            <Mail className="ml-2 h-4 w-4" />
                            تذكير العميل بالدفع
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-base font-semibold">حالة الطلب</Label>
                <Select value={status} onValueChange={(value) => handleStatusChange(value as OrderStatus)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">معلق</SelectItem>
                    <SelectItem value="processing">قيد المعالجة</SelectItem>
                    <SelectItem value="packed">مُجهز للشحن</SelectItem>
                    <SelectItem value="shipped">تم الشحن</SelectItem>
                    <SelectItem value="delivered">تم التوصيل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {trackingNumber && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-semibold mb-1">رقم التتبع:</p>
                  <p className="text-lg font-bold text-blue-900 font-mono">{trackingNumber}</p>
                  {order?.shipping_company && (
                    <p className="text-sm text-blue-600 mt-1">شركة الشحن: {order.shipping_company}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* المنتجات */}
        <Card className="group relative overflow-hidden border-r-4 border-green-500 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
            <Package className="w-6 h-6 text-green-500" />
          </div>
          <CardHeader>
            <CardTitle className="text-xl">المنتجات المطلوبة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order?.order_items?.map((item: any) => (
                <div 
                  key={item.id} 
                  className="flex justify-between items-center border-b pb-3 hover:bg-accent/5 p-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">الكمية: {item.quantity} × {item.unit_price} ريال</p>
                    </div>
                  </div>
                  <p className="font-bold text-xl">{item.total_price} ريال</p>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4 border-t-2 border-primary/20">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-primary" />
                  <p className="font-bold text-xl">المجموع الكلي</p>
                </div>
                <p className="font-bold text-3xl text-primary">{order?.total_amount} ريال</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipping Modal */}
      <ShippingModal
        open={showShippingModal}
        onClose={() => setShowShippingModal(false)}
        onSubmit={handleShippingSubmit}
        loading={updateMutation.isPending}
      />
    </AdminLayout>
  );
}
