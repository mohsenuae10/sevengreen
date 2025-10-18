import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { User, Mail, Phone, MapPin, Package, DollarSign, Calendar, Loader2, Truck, ExternalLink, Save, ArrowRight } from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCompany, setShippingCompany] = useState('');
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [isSavingTracking, setIsSavingTracking] = useState(false);
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
      setShippingCompany(data.shipping_company || '');
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

  const handleSaveTracking = async () => {
    if (!trackingNumber.trim()) {
      toast.error('يرجى إدخال رقم التتبع');
      return;
    }

    setIsSavingTracking(true);
    try {
      await updateMutation.mutateAsync({ 
        tracking_number: trackingNumber,
        shipping_company: shippingCompany,
        status: 'shipped'
      });

      // إرسال إيميل الشحن
      const { error } = await supabase.functions.invoke('send-tracking-email', {
        body: { order_id: id, tracking_number: trackingNumber },
      });
      
      if (error) {
        toast.error('تم حفظ رقم التتبع لكن فشل إرسال البريد');
      } else {
        toast.success('تم حفظ رقم التتبع وتغيير الحالة إلى "تم الشحن"');
      }
    } catch (error) {
      toast.error('خطأ في حفظ رقم التتبع');
    } finally {
      setIsSavingTracking(false);
    }
  };

  const getTrackingUrl = (company: string, trackingNum: string) => {
    const urls: { [key: string]: string } = {
      'SMSA': `https://www.smsaexpress.com/track/?tracknumbers=${trackingNum}`,
      'أرامكس': `https://www.aramex.com/ae/en/track/results?shipment_number=${trackingNum}`,
      'DHL': `https://www.dhl.com/sa-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNum}`,
      'UPS': `https://www.ups.com/track?tracknum=${trackingNum}`,
      'FedEx': `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNum}`,
    };
    return urls[company] || `https://www.google.com/search?q=${encodeURIComponent(company + ' tracking ' + trackingNum)}`;
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
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header - رقم الطلب والتاريخ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admin/orders')}
              className="gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              رجوع
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{order?.order_number}</h1>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {order?.created_at && new Date(order.created_at).toLocaleDateString('ar-SA', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          {order?.payment_status === 'pending' && (
            <Button 
              onClick={sendPaymentReminder}
              disabled={isSendingReminder}
              variant="outline"
              size="sm"
            >
              {isSendingReminder ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="ml-2 h-4 w-4" />
              )}
              تذكير بالدفع
            </Button>
          )}
        </div>

        {/* معلومات العميل والشحن */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* معلومات العميل */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                معلومات العميل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">الاسم</p>
                <p className="font-semibold">{order?.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الهاتف</p>
                <p className="font-semibold direction-ltr text-right">{order?.customer_phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                <p className="font-semibold text-sm">{order?.customer_email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المدينة</p>
                <p className="font-semibold">{order?.city}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">العنوان</p>
                <p className="font-semibold">{order?.shipping_address}</p>
              </div>
            </CardContent>
          </Card>

          {/* معلومات الشحن */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                معلومات الشحن
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order?.payment_status === 'completed' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="trackingNumber">رقم التتبع</Label>
                    <Input
                      id="trackingNumber"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="أدخل رقم التتبع..."
                      className="font-mono"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="shippingCompany">شركة الشحن</Label>
                    <Input
                      id="shippingCompany"
                      value={shippingCompany}
                      onChange={(e) => setShippingCompany(e.target.value)}
                      placeholder="أدخل اسم شركة الشحن..."
                    />
                  </div>

                  {trackingNumber && shippingCompany && (
                    <a 
                      href={getTrackingUrl(shippingCompany, trackingNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      تتبع الشحنة على موقع {shippingCompany}
                    </a>
                  )}

                  <Button 
                    onClick={handleSaveTracking}
                    disabled={isSavingTracking || !trackingNumber.trim()}
                    className="w-full"
                  >
                    {isSavingTracking ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="ml-2 h-4 w-4" />
                        حفظ رقم التتبع وتغيير الحالة
                      </>
                    )}
                  </Button>

                  {order?.status === 'shipped' && trackingNumber && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">رقم التتبع المحفوظ</p>
                      <p className="font-bold font-mono text-lg">{trackingNumber}</p>
                      {shippingCompany && (
                        <p className="text-xs text-muted-foreground mt-1">{shippingCompany}</p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-6 bg-destructive/5 border border-destructive/20 rounded-lg text-center">
                  <p className="text-destructive font-bold text-lg">غير مدفوع</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    لا يمكن إضافة رقم تتبع للطلبات غير المدفوعة
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* المنتجات والمجموع */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              المنتجات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {order?.order_items?.map((item: any) => (
                <div 
                  key={item.id} 
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-semibold">{item.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity} × {item.unit_price} ريال
                    </p>
                  </div>
                  <p className="font-bold">{item.total_price} ريال</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 border-t-2">
              <p className="font-bold text-lg">المجموع الكلي</p>
              <p className="font-bold text-2xl text-primary">{order?.total_amount} ريال</p>
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
