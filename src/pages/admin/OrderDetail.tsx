import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { OrderTimeline } from '@/components/admin/OrderTimeline';
import { QuickActionsPanel } from '@/components/admin/QuickActionsPanel';
import { ShippingModal } from '@/components/admin/ShippingModal';
import { User, Mail, Phone, MapPin, Package, DollarSign, Calendar, Loader2, Truck, ExternalLink, Save, ArrowRight, Edit2, AlertCircle } from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shippingCompany, setShippingCompany] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [isSavingTracking, setIsSavingTracking] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [isEditingTracking, setIsEditingTracking] = useState(false);
  const queryClient = useQueryClient();

  // Helper function to get status badge variant and label
  const getStatusInfo = (status: OrderStatus) => {
    const statusMap = {
      pending: { label: 'قيد الانتظار', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      processing: { label: 'قيد المعالجة', variant: 'default' as const, color: 'bg-blue-100 text-blue-800 border-blue-200' },
      packed: { label: 'جاهز للشحن', variant: 'default' as const, color: 'bg-purple-100 text-purple-800 border-purple-200' },
      shipped: { label: 'تم الشحن', variant: 'default' as const, color: 'bg-orange-100 text-orange-800 border-orange-200' },
      delivered: { label: 'تم التوصيل', variant: 'default' as const, color: 'bg-green-100 text-green-800 border-green-200' },
      cancelled: { label: 'ملغي', variant: 'destructive' as const, color: 'bg-red-100 text-red-800 border-red-200' },
    };
    return statusMap[status];
  };

  const getPaymentStatusInfo = (paymentStatus: string) => {
    return paymentStatus === 'completed' 
      ? { label: 'مدفوع', color: 'bg-green-100 text-green-800 border-green-200' }
      : { label: 'غير مدفوع', color: 'bg-red-100 text-red-800 border-red-200' };
  };

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

  const statusInfo = getStatusInfo(status);
  const paymentInfo = order ? getPaymentStatusInfo(order.payment_status) : null;

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-8">
        {/* Header - رقم الطلب والتاريخ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/admin/orders')}
              className="gap-2 hover:bg-accent"
            >
              <ArrowRight className="w-4 h-4" />
              رجوع
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold">{order?.order_number}</h1>
                <Badge className={`${statusInfo.color} border`}>
                  {statusInfo.label}
                </Badge>
                {paymentInfo && (
                  <Badge className={`${paymentInfo.color} border`}>
                    {paymentInfo.label}
                  </Badge>
                )}
              </div>
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
          <div className="flex gap-2">
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
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>مراحل الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTimeline
              currentStatus={status}
              createdAt={order?.created_at}
              packedAt={order?.packed_at}
              shippedAt={order?.shipped_at}
              deliveredAt={order?.delivered_at}
            />
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        {order?.payment_status === 'completed' && status !== 'delivered' && status !== 'cancelled' && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <QuickActionsPanel
                currentStatus={status}
                orderNumber={order?.order_number || ''}
                onStatusChange={handleStatusChange}
                onShipOrder={handleShipOrder}
              />
            </CardContent>
          </Card>
        )}

        {/* Status Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              إدارة حالة الطلب
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>تغيير الحالة</Label>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full">
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
            </div>

            {order?.payment_status === 'pending' && status !== 'pending' && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold">تنبيه: الطلب غير مدفوع</p>
                  <p className="mt-1">يُنصح بتغيير حالة الطلب فقط بعد استلام الدفع.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  معلومات الشحن
                </div>
                {order?.payment_status === 'completed' && trackingNumber && !isEditingTracking && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingTracking(true)}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    تعديل
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order?.payment_status === 'completed' ? (
                <div className="space-y-4">
                  {trackingNumber && !isEditingTracking ? (
                    // عرض معلومات الشحن
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">رقم التتبع</p>
                        <p className="font-bold font-mono text-xl mb-3">{trackingNumber}</p>
                        {shippingCompany && (
                          <>
                            <p className="text-xs text-muted-foreground mb-1">شركة الشحن</p>
                            <p className="font-semibold text-lg">{shippingCompany}</p>
                          </>
                        )}
                      </div>
                      
                      {trackingUrl && (
                        <a 
                          href={trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 p-3 text-sm text-primary hover:bg-primary/10 border-2 border-primary/20 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="font-semibold">تتبع الشحنة</span>
                        </a>
                      )}

                      {status === 'shipped' && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                          <p className="text-sm text-green-800 font-medium">تم شحن الطلب بنجاح</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // نموذج تعديل معلومات الشحن
                    <div className="space-y-4">
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

                      <div className="space-y-2">
                        <Label htmlFor="trackingUrl">رابط تتبع الشحنة (اختياري)</Label>
                        <Input
                          id="trackingUrl"
                          value={trackingUrl}
                          onChange={(e) => setTrackingUrl(e.target.value)}
                          placeholder="https://..."
                          type="url"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSaveTracking}
                          disabled={isSavingTracking || !trackingNumber.trim()}
                          className="flex-1"
                        >
                          {isSavingTracking ? (
                            <>
                              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                              جاري الحفظ...
                            </>
                          ) : (
                            <>
                              <Save className="ml-2 h-4 w-4" />
                              حفظ وتغيير الحالة
                            </>
                          )}
                        </Button>
                        {isEditingTracking && (
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setIsEditingTracking(false);
                              // إعادة تعيين القيم
                              setTrackingNumber(order?.tracking_number || '');
                              setShippingCompany(order?.shipping_company || '');
                            }}
                          >
                            إلغاء
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-destructive/5 border-2 border-destructive/20 rounded-lg text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  </div>
                  <p className="text-destructive font-bold text-lg mb-2">غير مدفوع</p>
                  <p className="text-sm text-muted-foreground">
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
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-semibold text-sm lg:text-base">{item.product_name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {item.quantity} × {item.unit_price} ريال
                    </p>
                  </div>
                  <p className="font-bold text-base lg:text-lg">{item.total_price} ريال</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4 border-t-2">
              <p className="font-bold text-base lg:text-lg">المجموع الكلي</p>
              <p className="font-bold text-xl lg:text-2xl text-primary">{order?.total_amount} ريال</p>
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

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد تغيير حالة الطلب</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من تغيير حالة الطلب إلى{' '}
              <span className="font-bold text-foreground">
                {pendingStatus && getStatusInfo(pendingStatus).label}
              </span>
              ؟
              {pendingStatus === 'shipped' && (
                <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm font-medium">سيتم إرسال إشعار للعميل برقم التتبع تلقائياً.</p>
                </div>
              )}
              {pendingStatus === 'cancelled' && (
                <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm font-medium text-destructive">تنبيه: لا يمكن التراجع عن إلغاء الطلب.</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              تأكيد التغيير
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
