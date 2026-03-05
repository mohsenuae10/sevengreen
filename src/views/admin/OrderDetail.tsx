import { useState } from 'react';
import { useParams, useNavigate } from '@/hooks/useNextRouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { OrderTimeline } from '@/components/admin/OrderTimeline';
import { ShippingModal } from '@/components/admin/ShippingModal';
import { User, Mail, Phone, MapPin, Package, Calendar, Loader2, Truck, Save, ArrowRight, AlertCircle } from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

const statusLabels: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  processing: { label: 'قيد المعالجة', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  packed: { label: 'جاهز للشحن', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  shipped: { label: 'تم الشحن', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  delivered: { label: 'تم التوصيل', color: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-800 border-red-200' },
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

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
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: { status?: OrderStatus; tracking_number?: string; shipping_company?: string }) => {
      const { error } = await supabase.from('orders').update(updates).eq('id', id);
      if (error) throw error;
      return updates;
    },
    onSuccess: async (updates) => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('تم تحديث الطلب بنجاح');

      if (updates.status === 'shipped' && updates.tracking_number) {
        const { error } = await supabase.functions.invoke('send-tracking-email', {
          body: { order_id: id, tracking_number: updates.tracking_number },
        });
        if (error) toast.error('تم التحديث لكن فشل إرسال البريد');
        else toast.success('تم إرسال إشعار الشحن للعميل');
      } else if (updates.status && updates.status !== 'shipped') {
        try {
          await supabase.functions.invoke('send-order-status-update', {
            body: { order_id: id, new_status: updates.status, old_status: order?.status },
          });
        } catch (e) { console.error('Error sending status email:', e); }
      }
    },
    onError: () => toast.error('حدث خطأ أثناء تحديث الطلب'),
  });

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (newStatus === 'shipped') {
      setShowShippingModal(true);
      return;
    }
    setPendingStatus(newStatus);
    setShowStatusDialog(true);
  };

  const confirmStatusChange = () => {
    if (pendingStatus) {
      setStatus(pendingStatus);
      updateMutation.mutate({ status: pendingStatus });
      setShowStatusDialog(false);
      setPendingStatus(null);
    }
  };

  const handleShippingSubmit = async (data: { trackingNumber: string; company: string; sendEmail: boolean }) => {
    await updateMutation.mutateAsync({
      status: 'shipped',
      tracking_number: data.trackingNumber,
      shipping_company: data.company,
    });
    setShowShippingModal(false);
  };

  const sendPaymentReminder = async () => {
    setIsSendingReminder(true);
    try {
      const { error } = await supabase.functions.invoke('send-payment-reminder', { body: { order_id: id } });
      if (error) toast.error('خطأ في إرسال التذكير');
      else toast.success('تم إرسال تذكير الدفع بنجاح');
    } catch { toast.error('خطأ في إرسال التذكير'); }
    finally { setIsSendingReminder(false); }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  const isPaid = order?.payment_status === 'completed';
  const statusInfo = statusLabels[status];

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-5 animate-fade-in pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 bg-card p-4 rounded-lg border">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')} className="gap-2">
            <ArrowRight className="w-4 h-4" />
            رجوع
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold">{order?.order_number}</h1>
              <Badge className={`${statusInfo.color} border`}>{statusInfo.label}</Badge>
              <Badge className={`border ${isPaid ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                {isPaid ? 'مدفوع' : 'غير مدفوع'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {order?.created_at && new Date(order.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* تحذير عدم الدفع */}
        {!isPaid && (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-8 h-8 text-yellow-600 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-yellow-900">الطلب غير مدفوع</p>
                  <p className="text-sm text-yellow-800">أرسل تذكير للعميل بالدفع</p>
                </div>
                <Button onClick={sendPaymentReminder} disabled={isSendingReminder} size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                  {isSendingReminder ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4 ml-1" />}
                  تذكير
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">مراحل الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTimeline currentStatus={status} createdAt={order?.created_at} packedAt={order?.packed_at} shippedAt={order?.shipped_at} deliveredAt={order?.delivered_at} />
          </CardContent>
        </Card>

        {/* إدارة الحالة - فقط للمدفوع */}
        {isPaid && status !== 'delivered' && status !== 'cancelled' && (
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-sm font-semibold shrink-0">تغيير الحالة:</p>
                <Select value={status} onValueChange={(v) => handleStatusChange(v as OrderStatus)}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="processing">قيد المعالجة</SelectItem>
                    <SelectItem value="packed">جاهز للشحن</SelectItem>
                    <SelectItem value="shipped">تم الشحن</SelectItem>
                    <SelectItem value="delivered">تم التوصيل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
                {status === 'shipped' && order?.tracking_number && (
                  <Button onClick={() => handleStatusChange('delivered')} size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1">
                    <Package className="w-4 h-4" /> تأكيد التوصيل
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* معلومات الشحن - إذا مشحون */}
        {order?.tracking_number && (status === 'shipped' || status === 'delivered') && (
          <Card className="border-orange-200">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-orange-600 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">رقم التتبع</p>
                  <p className="font-bold font-mono text-lg">{order.tracking_number}</p>
                  {order.shipping_company && <p className="text-sm text-muted-foreground">{order.shipping_company}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* معلومات العميل + الشحن */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4" /> العميل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold">{order?.customer_name}</p>
              <p className="flex items-center gap-1 text-muted-foreground"><Phone className="w-3 h-3" /> {order?.customer_phone}</p>
              <p className="flex items-center gap-1 text-muted-foreground"><Mail className="w-3 h-3" /> {order?.customer_email}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><MapPin className="w-4 h-4" /> عنوان الشحن</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold">{order?.city}</p>
              <p className="text-muted-foreground">{order?.shipping_address}</p>
              {order?.notes && <p className="text-xs text-muted-foreground border-t pt-2 mt-2">ملاحظات: {order.notes}</p>}
            </CardContent>
          </Card>
        </div>

        {/* المنتجات */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><Package className="w-4 h-4" /> المنتجات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order?.order_items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <p className="font-semibold text-sm">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} × {item.unit_price} ريال</p>
                </div>
                <p className="font-bold">{item.total_price} ريال</p>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 border-t-2">
              {order?.shipping_fee > 0 && (
                <p className="text-sm text-muted-foreground">شحن: {order.shipping_fee} ريال</p>
              )}
              <div className="mr-auto text-left">
                <p className="text-xs text-muted-foreground">المجموع</p>
                <p className="font-bold text-xl text-primary">{order?.total_amount} ريال</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ShippingModal
        open={showShippingModal}
        onClose={() => setShowShippingModal(false)}
        onSubmit={handleShippingSubmit}
        loading={updateMutation.isPending}
      />

      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد تغيير الحالة</AlertDialogTitle>
            <AlertDialogDescription>
              تغيير حالة الطلب إلى <span className="font-bold text-foreground">{pendingStatus && statusLabels[pendingStatus].label}</span>؟
              {pendingStatus === 'cancelled' && (
                <span className="block mt-2 text-destructive font-semibold">تحذير: لا يمكن التراجع عن الإلغاء</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>تأكيد</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
