import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, CheckCircle, Truck, CreditCard, AlertCircle, Mail, Loader2, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useNavigate } from '@/hooks/useNextRouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';

const shippingCompanies = [
  { value: 'smsa', label: 'SMSA Express' },
  { value: 'aramex', label: 'Aramex' },
  { value: 'dhl', label: 'DHL' },
  { value: 'fedex', label: 'FedEx' },
  { value: 'other', label: 'أخرى' },
];

export default function AdminOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // حالة نموذج الشحن لكل طلب
  const [shippingForms, setShippingForms] = useState<Record<string, { company: string; tracking: string; link: string }>>({});

  // حالة تذكير الدفع
  const [reminderLoading, setReminderLoading] = useState<Record<string, boolean>>({});

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const shipMutation = useMutation({
    mutationFn: async ({ orderId, tracking, company, link }: { orderId: string; tracking: string; company: string; link: string }) => {
      const updates: any = { status: 'shipped', tracking_number: tracking, shipping_company: company };
      if (link) updates.tracking_url = link;
      const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
      if (error) throw error;
      return { orderId, tracking };
    },
    onSuccess: async ({ orderId, tracking }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('تم شحن الطلب بنجاح');
      // مسح النموذج
      setShippingForms(prev => { const n = { ...prev }; delete n[orderId]; return n; });
      // إرسال إشعار
      try {
        await supabase.functions.invoke('send-tracking-email', {
          body: { order_id: orderId, tracking_number: tracking },
        });
        toast.success('تم إرسال إشعار الشحن للعميل');
      } catch (e) { console.error(e); }
    },
    onError: () => toast.error('حدث خطأ أثناء الشحن'),
  });

  const sendReminder = async (orderId: string) => {
    setReminderLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      const { error } = await supabase.functions.invoke('send-payment-reminder', { body: { order_id: orderId } });
      toast[error ? 'error' : 'success'](error ? 'خطأ في الإرسال' : 'تم إرسال التذكير بنجاح');
    } catch { toast.error('خطأ'); }
    finally { setReminderLoading(prev => ({ ...prev, [orderId]: false })); }
  };

  const getForm = (id: string) => shippingForms[id] || { company: 'smsa', tracking: '', link: '' };
  const updateForm = (id: string, field: string, value: string) => {
    setShippingForms(prev => ({ ...prev, [id]: { ...getForm(id), [field]: value } }));
  };

  // تصنيف الطلبات
  const readyToShip = orders?.filter(o => o.payment_status === 'completed' && o.status !== 'shipped' && o.status !== 'delivered' && o.status !== 'cancelled') || [];
  const pendingPayment = orders?.filter(o => o.payment_status === 'pending' || o.payment_status === 'failed') || [];
  const shipped = orders?.filter(o => o.status === 'shipped') || [];
  const all = orders || [];

  const tabs = [
    { value: 'ready', label: 'جاهز للشحن', icon: CreditCard, count: readyToShip.length },
    { value: 'pending-payment', label: 'بانتظار الدفع', icon: AlertCircle, count: pendingPayment.length },
    { value: 'shipped', label: 'مشحونة', icon: Truck, count: shipped.length },
    { value: 'all', label: 'الكل', icon: Package, count: all.length },
  ];

  const OrderHeader = ({ order }: { order: any }) => (
    <div
      className="flex items-start justify-between gap-3 cursor-pointer"
      onClick={() => navigate(`/admin/orders/${order.id}`)}
    >
      <div className="flex-1 min-w-0 space-y-1">
        <span className="font-mono text-sm font-bold">{order.order_number}</span>
        <p className="font-semibold truncate">{order.customer_name}</p>
        <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
      </div>
      <div className="text-left shrink-0 space-y-1">
        <p className="font-bold text-primary text-lg">{order.total_amount?.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground">ريال</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: ar })}
        </p>
      </div>
    </div>
  );

  const EmptyState = ({ text }: { text: string }) => (
    <div className="text-center py-12 text-muted-foreground">
      <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>{text}</p>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">إدارة الطلبات</h1>
          <p className="text-muted-foreground mt-1 text-sm">{orders?.length || 0} طلب إجمالي</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="ready" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-11">
              {tabs.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-xs sm:text-sm px-2">
                  <tab.icon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] min-w-[20px]">
                      {tab.count}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ===== جاهز للشحن ===== */}
            <TabsContent value="ready" className="mt-4">
              {readyToShip.length === 0 ? <EmptyState text="لا توجد طلبات جاهزة للشحن" /> : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {readyToShip.map(order => {
                    const form = getForm(order.id);
                    return (
                      <Card key={order.id} className="hover:shadow-md transition-all">
                        <CardContent className="p-4 space-y-3">
                          <OrderHeader order={order} />
                          <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="w-3 h-3 ml-1" /> مدفوع
                          </Badge>

                          {/* نموذج الشحن */}
                          <div className="space-y-2 border-t pt-3">
                            <Select value={form.company} onValueChange={v => updateForm(order.id, 'company', v)}>
                              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="شركة الشحن" /></SelectTrigger>
                              <SelectContent>
                                {shippingCompanies.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="رقم التتبع *"
                              value={form.tracking}
                              onChange={e => updateForm(order.id, 'tracking', e.target.value)}
                              className="h-9 text-xs"
                              dir="ltr"
                            />
                            <div className="relative">
                              <LinkIcon className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                              <Input
                                placeholder="رابط التتبع (اختياري)"
                                value={form.link}
                                onChange={e => updateForm(order.id, 'link', e.target.value)}
                                className="h-9 text-xs pr-8"
                                dir="ltr"
                              />
                            </div>
                            <Button
                              onClick={() => shipMutation.mutate({ orderId: order.id, tracking: form.tracking, company: form.company, link: form.link })}
                              disabled={!form.tracking.trim() || shipMutation.isPending}
                              size="sm"
                              className="w-full bg-orange-600 hover:bg-orange-700 gap-1.5"
                            >
                              {shipMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                              شحن الطلب
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ===== بانتظار الدفع ===== */}
            <TabsContent value="pending-payment" className="mt-4">
              {pendingPayment.length === 0 ? <EmptyState text="لا توجد طلبات بانتظار الدفع" /> : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {pendingPayment.map(order => (
                    <Card key={order.id} className="hover:shadow-md transition-all border-yellow-200">
                      <CardContent className="p-4 space-y-3">
                        <OrderHeader order={order} />
                        <div className="flex items-center justify-between gap-2 border-t pt-3">
                          <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertCircle className="w-3 h-3 ml-1" /> غير مدفوع
                          </Badge>
                          <Button
                            onClick={(e) => { e.stopPropagation(); sendReminder(order.id); }}
                            disabled={reminderLoading[order.id]}
                            size="sm"
                            variant="outline"
                            className="gap-1.5 border-yellow-400 text-yellow-800 hover:bg-yellow-50"
                          >
                            {reminderLoading[order.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                            تذكير بالدفع
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ===== مشحونة ===== */}
            <TabsContent value="shipped" className="mt-4">
              {shipped.length === 0 ? <EmptyState text="لا توجد طلبات مشحونة" /> : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {shipped.map(order => (
                    <Card key={order.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                      <CardContent className="p-4 space-y-3">
                        <OrderHeader order={order} />
                        <div className="flex items-center gap-2 border-t pt-3">
                          <Truck className="w-4 h-4 text-orange-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-muted-foreground">رقم التتبع</p>
                            <p className="font-mono text-sm font-bold truncate">{order.tracking_number || '—'}</p>
                          </div>
                          {order.shipping_company && (
                            <Badge variant="outline" className="text-xs shrink-0">{order.shipping_company}</Badge>
                          )}
                          {(order as any).tracking_url && (
                            <a href={(order as any).tracking_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                              <ExternalLink className="w-4 h-4 text-blue-600" />
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ===== الكل ===== */}
            <TabsContent value="all" className="mt-4">
              {all.length === 0 ? <EmptyState text="لا توجد طلبات" /> : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {all.map(order => {
                    const isPaid = order.payment_status === 'completed';
                    const statusLabels: Record<string, string> = {
                      pending: 'معلق', processing: 'معالجة', packed: 'مجهز',
                      shipped: 'مشحون', delivered: 'تم التوصيل', cancelled: 'ملغي',
                    };
                    return (
                      <Card key={order.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                        <CardContent className="p-4 space-y-2">
                          <OrderHeader order={order} />
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}>
                              {isPaid ? 'مدفوع' : 'غير مدفوع'}
                            </Badge>
                            <Badge variant="outline">{statusLabels[order.status] || order.status}</Badge>
                            {order.tracking_number && (
                              <span className="text-[10px] font-mono text-muted-foreground">#{order.tracking_number}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
}
