import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, CheckCircle, XCircle, Truck, Box, CreditCard, AlertCircle } from 'lucide-react';
import { useNavigate } from '@/hooks/useNextRouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'معلق', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
  processing: { label: 'قيد المعالجة', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Package },
  packed: { label: 'مُجهز', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: Box },
  shipped: { label: 'تم الشحن', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: Truck },
  delivered: { label: 'تم التوصيل', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle },
};

const paymentLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'غير مدفوع', color: 'bg-amber-100 text-amber-800' },
  completed: { label: 'مدفوع', color: 'bg-emerald-100 text-emerald-800' },
  failed: { label: 'فشل الدفع', color: 'bg-red-100 text-red-800' },
};

export default function AdminOrders() {
  const navigate = useNavigate();

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

  const filterOrders = (tab: string) => {
    if (!orders) return [];
    switch (tab) {
      case 'all': return orders;
      case 'pending-payment': return orders.filter(o => o.payment_status === 'pending');
      case 'paid': return orders.filter(o => o.payment_status === 'completed' && o.status !== 'shipped' && o.status !== 'delivered');
      case 'pending': return orders.filter(o => o.status === 'pending');
      case 'processing': return orders.filter(o => o.status === 'processing');
      case 'packed': return orders.filter(o => o.status === 'packed');
      case 'shipped': return orders.filter(o => o.status === 'shipped');
      case 'delivered': return orders.filter(o => o.status === 'delivered');
      case 'cancelled': return orders.filter(o => o.status === 'cancelled');
      default: return orders;
    }
  };

  const getCount = (tab: string) => filterOrders(tab).length;

  const OrderCard = ({ order }: { order: any }) => {
    const status = statusConfig[order.status] || statusConfig.pending;
    const payment = paymentLabels[order.payment_status] || paymentLabels.pending;
    const isDelayed = order.status === 'pending' &&
      (Date.now() - new Date(order.created_at).getTime()) > 24 * 60 * 60 * 1000;

    return (
      <Card
        className={`hover:shadow-md transition-all cursor-pointer ${isDelayed ? 'border-yellow-300' : ''}`}
        onClick={() => navigate(`/admin/orders/${order.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-bold">{order.order_number}</span>
                {isDelayed && <Badge variant="outline" className="text-yellow-700 border-yellow-300 text-xs">⚠️ متأخر</Badge>}
              </div>
              <p className="font-semibold truncate">{order.customer_name}</p>
              <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={status.color}>{status.label}</Badge>
                <Badge className={payment.color}>{payment.label}</Badge>
              </div>
            </div>
            <div className="text-left shrink-0 space-y-1">
              <p className="font-bold text-primary text-lg">{order.total_amount.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">ريال</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: ar })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const OrdersList = ({ tab }: { tab: string }) => {
    const filtered = filterOrders(tab);
    if (filtered.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد طلبات</p>
        </div>
      );
    }
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map(order => <OrderCard key={order.id} order={order} />)}
      </div>
    );
  };

  const tabs = [
    { value: 'all', label: 'الكل', icon: Package },
    { value: 'pending-payment', label: 'انتظار الدفع', icon: AlertCircle },
    { value: 'paid', label: 'مدفوعة', icon: CreditCard },
    { value: 'pending', label: 'معلقة', icon: Clock },
    { value: 'processing', label: 'معالجة', icon: Package },
    { value: 'packed', label: 'مُجهزة', icon: Box },
    { value: 'shipped', label: 'مشحونة', icon: Truck },
    { value: 'delivered', label: 'مُسلّمة', icon: CheckCircle },
    { value: 'cancelled', label: 'ملغاة', icon: XCircle },
  ];

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
          <Tabs defaultValue="all" className="w-full">
            <ScrollArea className="w-full whitespace-nowrap">
              <TabsList className="inline-flex w-max h-10 gap-1 bg-muted/50 p-1">
                {tabs.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5 text-xs px-3">
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {getCount(tab.value) > 0 && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px] min-w-[20px]">
                        {getCount(tab.value)}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {tabs.map(tab => (
              <TabsContent key={tab.value} value={tab.value} className="mt-4">
                <OrdersList tab={tab.value} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
}
