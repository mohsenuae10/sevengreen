import { useState } from 'react';
import { useParams, useNavigate } from '@/hooks/useNextRouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Package, Loader2, Truck, ArrowRight, AlertCircle, Clock, Box, CheckCircle, XCircle } from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

const steps: { key: OrderStatus; label: string; icon: any; color: string }[] = [
  { key: 'pending', label: 'معلق', icon: Clock, color: 'text-yellow-600 bg-yellow-100 border-yellow-300' },
  { key: 'processing', label: 'معالجة', icon: Package, color: 'text-blue-600 bg-blue-100 border-blue-300' },
  { key: 'packed', label: 'مُجهز', icon: Box, color: 'text-purple-600 bg-purple-100 border-purple-300' },
  { key: 'shipped', label: 'مشحون', icon: Truck, color: 'text-orange-600 bg-orange-100 border-orange-300' },
  { key: 'delivered', label: 'مُسلّم', icon: CheckCircle, color: 'text-green-600 bg-green-100 border-green-300' },
];

const shippingCompanies = [
  { value: 'smsa', label: 'SMSA Express' },
  { value: 'aramex', label: 'Aramex' },
  { value: 'dhl', label: 'DHL' },
  { value: 'fedex', label: 'FedEx' },
  { value: 'other', label: 'أخرى' },
];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCompany, setShippingCompany] = useState('smsa');

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
      toast.success('تم تحديث الطلب');

      if (updates.status === 'shipped' && updates.tracking_number) {
        const { error } = await supabase.functions.invoke('send-tracking-email', {
          body: { order_id: id, tracking_number: updates.tracking_number },
        });
        if (!error) toast.success('تم إرسال إشعار الشحن للعميل');
      } else if (updates.status && updates.status !== 'shipped') {
        try {
          await supabase.functions.invoke('send-order-status-update', {
            body: { order_id: id, new_status: updates.status, old_status: order?.status },
          });
        } catch (e) { console.error(e); }
      }
    },
    onError: () => toast.error('حدث خطأ'),
  });

  const changeStatus = (newStatus: OrderStatus) => {
    setStatus(newStatus);
    updateMutation.mutate({ status: newStatus });
  };

  const shipOrder = () => {
    if (!trackingNumber.trim()) { toast.error('أدخل رقم التتبع'); return; }
    setStatus('shipped');
    updateMutation.mutate({ status: 'shipped', tracking_number: trackingNumber.trim(), shipping_company: shippingCompany });
  };

  const sendPaymentReminder = async () => {
    setIsSendingReminder(true);
    try {
      const { error } = await supabase.functions.invoke('send-payment-reminder', { body: { order_id: id } });
      toast[error ? 'error' : 'success'](error ? 'خطأ في الإرسال' : 'تم إرسال التذكير');
    } catch { toast.error('خطأ'); }
    finally { setIsSendingReminder(false); }
  };

  if (isLoading) {
    return <AdminLayout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div></AdminLayout>;
  }

  const isPaid = order?.payment_status === 'completed';
  const currentStepIndex = steps.findIndex(s => s.key === status);
  const isCancelled = status === 'cancelled';
  const isDone = status === 'delivered' || isCancelled;

  // الخطوة التالية
  const nextStep = !isDone && isPaid && currentStepIndex < steps.length - 1 ? steps[currentStepIndex + 1] : null;

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-in pb-8">

        {/* Header */}
        <div className="flex items-center gap-3 bg-card p-3 rounded-lg border">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/orders')}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{order?.order_number}</h1>
            <p className="text-xs text-muted-foreground">
              {order?.created_at && new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <Badge className={`border ${isPaid ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
            {isPaid ? 'مدفوع ✓' : 'غير مدفوع'}
          </Badge>
        </div>

        {/* تحذير عدم الدفع */}
        {!isPaid && (
          <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
            <p className="text-sm text-yellow-900 flex-1">الطلب غير مدفوع - لا يمكن معالجته</p>
            <Button onClick={sendPaymentReminder} disabled={isSendingReminder} size="sm" variant="outline" className="border-yellow-400 text-yellow-800 hover:bg-yellow-100">
              {isSendingReminder ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Mail className="h-3.5 w-3.5 ml-1" />تذكير</>}
            </Button>
          </div>
        )}

        {/* مراحل الطلب - شريط بسيط */}
        <Card>
          <CardContent className="pt-5 pb-4">
            {isCancelled ? (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-bold">تم إلغاء الطلب</span>
              </div>
            ) : (
              <>
                {/* خطوات التقدم */}
                <div className="flex items-center gap-1 mb-4">
                  {steps.map((step, i) => {
                    const Icon = step.icon;
                    const done = i < currentStepIndex;
                    const active = i === currentStepIndex;
                    return (
                      <div key={step.key} className="flex items-center flex-1">
                        <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold w-full justify-center
                          ${done ? 'bg-primary/10 text-primary' : active ? step.color + ' border' : 'bg-muted text-muted-foreground'}
                        `}>
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="hidden sm:inline">{step.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* زر الإجراء التالي */}
                {nextStep && nextStep.key !== 'shipped' && (
                  <Button
                    onClick={() => changeStatus(nextStep.key)}
                    disabled={updateMutation.isPending}
                    className="w-full gap-2"
                    size="sm"
                  >
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <nextStep.icon className="w-4 h-4" />}
                    نقل إلى: {nextStep.label}
                  </Button>
                )}

                {/* نموذج الشحن المدمج */}
                {nextStep?.key === 'shipped' && isPaid && (
                  <div className="space-y-3 border rounded-lg p-3 bg-orange-50/50">
                    <p className="font-semibold text-sm flex items-center gap-1.5"><Truck className="w-4 h-4 text-orange-600" /> شحن الطلب</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <Select value={shippingCompany} onValueChange={setShippingCompany}>
                        <SelectTrigger className="bg-white h-9"><SelectValue placeholder="شركة الشحن" /></SelectTrigger>
                        <SelectContent>
                          {shippingCompanies.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input placeholder="رقم التتبع" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} className="bg-white h-9" dir="ltr" />
                    </div>
                    <Button onClick={shipOrder} disabled={updateMutation.isPending || !trackingNumber.trim()} size="sm" className="w-full bg-orange-600 hover:bg-orange-700 gap-2">
                      {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                      تأكيد الشحن وإرسال إشعار للعميل
                    </Button>
                  </div>
                )}

                {/* زر تأكيد التوصيل */}
                {status === 'shipped' && (
                  <Button onClick={() => changeStatus('delivered')} disabled={updateMutation.isPending} className="w-full gap-2 bg-green-600 hover:bg-green-700" size="sm">
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    تأكيد التوصيل
                  </Button>
                )}

                {/* إلغاء */}
                {!isDone && isPaid && (
                  <Button onClick={() => changeStatus('cancelled')} variant="ghost" size="sm" className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                    <XCircle className="w-3.5 h-3.5 ml-1" /> إلغاء الطلب
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* رقم التتبع - إذا مشحون */}
        {order?.tracking_number && (status === 'shipped' || status === 'delivered') && (
          <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
            <Truck className="w-5 h-5 text-orange-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">رقم التتبع</p>
              <p className="font-bold font-mono truncate">{order.tracking_number}</p>
            </div>
            {order.shipping_company && <Badge variant="outline">{order.shipping_company}</Badge>}
          </div>
        )}

        {/* العميل والعنوان - كارد واحد */}
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground mb-2">العميل</p>
                <p className="font-semibold">{order?.customer_name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {order?.customer_phone}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> <span className="truncate">{order?.customer_email}</span></p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground mb-2">العنوان</p>
                <p className="font-semibold flex items-center gap-1"><MapPin className="w-3 h-3" /> {order?.city}</p>
                <p className="text-sm text-muted-foreground">{order?.shipping_address}</p>
                {order?.notes && <p className="text-xs text-muted-foreground italic">ملاحظات: {order.notes}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* المنتجات */}
        <Card>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs font-semibold text-muted-foreground mb-3">المنتجات</p>
            {order?.order_items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0 text-sm">
                <div>
                  <span className="font-medium">{item.product_name}</span>
                  <span className="text-muted-foreground mr-2">×{item.quantity}</span>
                </div>
                <span className="font-bold">{item.total_price} ر.س</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 mt-2 border-t-2">
              <div>
                {order?.shipping_fee > 0 && <span className="text-xs text-muted-foreground">شحن: {order.shipping_fee} ر.س</span>}
              </div>
              <span className="font-bold text-lg text-primary">{order?.total_amount} ر.س</span>
            </div>
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  );
}
