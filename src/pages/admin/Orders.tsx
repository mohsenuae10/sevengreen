import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MapPin, Phone, Mail, Package, Clock, CheckCircle, XCircle, Truck, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  packed: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  shipped: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  processing: Package,
  packed: Box,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const statusLabels: Record<string, string> = {
  pending: 'معلق',
  processing: 'قيد المعالجة',
  packed: 'مُجهز',
  shipped: 'تم الشحن',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const COUNTRIES: Record<string, string> = {
  'SA': 'السعودية 🇸🇦',
  'AE': 'الإمارات 🇦🇪',
  'KW': 'الكويت 🇰🇼',
  'QA': 'قطر 🇶🇦',
  'BH': 'البحرين 🇧🇭',
  'OM': 'عمان 🇴🇲',
  'JO': 'الأردن 🇯🇴',
  'LB': 'لبنان 🇱🇧',
  'EG': 'مصر 🇪🇬',
  'IQ': 'العراق 🇮🇶',
  'SY': 'سوريا 🇸🇾',
  'YE': 'اليمن 🇾🇪',
  'MA': 'المغرب 🇲🇦',
  'DZ': 'الجزائر 🇩🇿',
  'TN': 'تونس 🇹🇳',
  'LY': 'ليبيا 🇱🇾',
  'SD': 'السودان 🇸🇩',
  'PS': 'فلسطين 🇵🇸',
};

// دالة لحساب نسبة التقدم بناءً على الحالة
const getProgressPercentage = (status: string): number => {
  const progressMap: Record<string, number> = {
    pending: 20,
    processing: 40,
    packed: 60,
    shipped: 80,
    delivered: 100,
    cancelled: 0,
  };
  return progressMap[status] || 0;
};

// دالة للتحقق من التأخير
const isDelayed = (createdAt: string, status: string): boolean => {
  const hoursSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  if (status === 'pending' && hoursSinceCreation > 24) return true;
  if (status === 'processing' && hoursSinceCreation > 48) return true;
  return false;
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

  const filterOrders = (status?: string) => {
    if (!status) return orders;
    return orders?.filter((order) => order.status === status);
  };

  const OrdersTable = ({ orders }: { orders: any[] }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-[120px] font-bold">رقم الطلب</TableHead>
            <TableHead className="min-w-[150px] font-bold">معلومات العميل</TableHead>
            <TableHead className="min-w-[200px] font-bold">معلومات الشحن</TableHead>
            <TableHead className="min-w-[100px] font-bold">المبلغ</TableHead>
            <TableHead className="min-w-[180px] font-bold">التقدم</TableHead>
            <TableHead className="min-w-[120px] font-bold">حالة الدفع</TableHead>
            <TableHead className="min-w-[120px] font-bold">الوقت</TableHead>
            <TableHead className="min-w-[100px] font-bold">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders?.map((order) => {
            const StatusIcon = statusIcons[order.status] || Package;
            const progress = getProgressPercentage(order.status);
            const delayed = isDelayed(order.created_at, order.status);
            
            return (
              <TableRow 
                key={order.id} 
                className={`
                  hover:bg-accent/50 transition-all duration-200 cursor-pointer
                  ${delayed ? 'bg-yellow-50/50 dark:bg-yellow-950/20' : ''}
                  ${order.payment_status === 'completed' && order.status === 'pending' 
                    ? 'bg-blue-50/50 dark:bg-blue-950/20' 
                    : ''
                  }
                `}
                onClick={() => navigate(`/admin/orders/${order.id}`)}
              >
                <TableCell className="font-mono text-sm font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    {order.order_number}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1.5">
                    <div className="font-semibold text-base">{order.customer_name}</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[150px]">{order.customer_email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{order.customer_phone}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-semibold">
                        {COUNTRIES[order.country_code] || order.country_code}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div className="font-medium">{order.city}</div>
                      <div className="truncate max-w-[180px]">{order.shipping_address}</div>
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="font-bold text-lg text-primary">
                    {order.total_amount.toFixed(2)} ريال
                  </div>
                  {order.shipping_fee > 0 && (
                    <div className="text-xs text-muted-foreground">
                      شحن: {order.shipping_fee.toFixed(2)} ريال
                    </div>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusColors[order.status]}`}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      <Badge className={statusColors[order.status]}>
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                    {/* شريط التقدم */}
                    <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          order.status === 'cancelled' 
                            ? 'bg-red-500' 
                            : 'bg-gradient-to-r from-primary to-primary-light'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {progress}% مكتمل
                    </p>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge className={paymentStatusColors[order.payment_status]}>
                    {order.payment_status === 'pending' ? 'معلق' :
                     order.payment_status === 'completed' ? 'مكتمل' :
                     order.payment_status === 'failed' ? 'فشل' : order.payment_status}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {formatDistanceToNow(new Date(order.created_at), { 
                        addSuffix: true, 
                        locale: ar 
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                  {delayed && (
                    <Badge variant="outline" className="mt-1 text-yellow-700 border-yellow-300">
                      ⚠️ متأخر
                    </Badge>
                  )}
                </TableCell>
                
                <TableCell>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/orders/${order.id}`);
                    }}
                    className="w-full gap-2 hover:scale-105 transition-transform"
                  >
                    <Eye className="h-4 w-4" />
                    عرض
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            إدارة الطلبات
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            عرض وإدارة جميع الطلبات مع معلومات الشحن الكاملة
          </p>
        </div>

        <Card className="group relative overflow-hidden border-r-4 border-primary bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-2xl">
              <span>قائمة الطلبات</span>
              {orders && (
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {orders.length} طلب
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <div className="text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-muted-foreground">جاري تحميل الطلبات...</p>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-7 h-12">
                  <TabsTrigger value="all" className="gap-2">
                    <Package className="w-4 h-4" />
                    الكل
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="gap-2">
                    <Clock className="w-4 h-4" />
                    معلق
                  </TabsTrigger>
                  <TabsTrigger value="processing" className="gap-2">
                    <Package className="w-4 h-4" />
                    قيد المعالجة
                  </TabsTrigger>
                  <TabsTrigger value="packed" className="gap-2">
                    <Box className="w-4 h-4" />
                    مُجهز
                  </TabsTrigger>
                  <TabsTrigger value="shipped" className="gap-2">
                    <Truck className="w-4 h-4" />
                    مشحون
                  </TabsTrigger>
                  <TabsTrigger value="delivered" className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    تم التوصيل
                  </TabsTrigger>
                  <TabsTrigger value="cancelled" className="gap-2">
                    <XCircle className="w-4 h-4" />
                    ملغي
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-6">
                  <OrdersTable orders={filterOrders() || []} />
                </TabsContent>
                <TabsContent value="pending" className="mt-6">
                  <OrdersTable orders={filterOrders('pending') || []} />
                </TabsContent>
                <TabsContent value="processing" className="mt-6">
                  <OrdersTable orders={filterOrders('processing') || []} />
                </TabsContent>
                <TabsContent value="packed" className="mt-6">
                  <OrdersTable orders={filterOrders('packed') || []} />
                </TabsContent>
                <TabsContent value="shipped" className="mt-6">
                  <OrdersTable orders={filterOrders('shipped') || []} />
                </TabsContent>
                <TabsContent value="delivered" className="mt-6">
                  <OrdersTable orders={filterOrders('delivered') || []} />
                </TabsContent>
                <TabsContent value="cancelled" className="mt-6">
                  <OrdersTable orders={filterOrders('cancelled') || []} />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
