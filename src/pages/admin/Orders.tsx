import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MapPin, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

// قائمة الدول العربية ودول الخليج
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
          <TableRow>
            <TableHead className="min-w-[120px]">رقم الطلب</TableHead>
            <TableHead className="min-w-[150px]">معلومات العميل</TableHead>
            <TableHead className="min-w-[200px]">معلومات الشحن</TableHead>
            <TableHead className="min-w-[100px]">المبلغ</TableHead>
            <TableHead className="min-w-[120px]">حالة الطلب</TableHead>
            <TableHead className="min-w-[120px]">حالة الدفع</TableHead>
            <TableHead className="min-w-[100px]">التاريخ</TableHead>
            <TableHead className="min-w-[100px]">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders?.map((order) => (
            <TableRow key={order.id} className="hover:bg-muted/50">
              <TableCell className="font-mono text-sm font-medium">
                {order.order_number}
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{order.customer_name}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate max-w-[150px]">{order.customer_email}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{order.customer_phone}</span>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3 text-primary" />
                    <span className="font-medium">
                      {COUNTRIES[order.country_code] || order.country_code}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div>{order.city}</div>
                    <div className="truncate max-w-[180px]">{order.shipping_address}</div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="font-bold text-primary">
                  {order.total_amount.toFixed(2)} ريال
                </div>
                {order.shipping_fee > 0 && (
                  <div className="text-xs text-muted-foreground">
                    شحن: {order.shipping_fee.toFixed(2)} ريال
                  </div>
                )}
              </TableCell>
              
              <TableCell>
                <Badge className={statusColors[order.status]}>
                  {order.status === 'pending' ? 'قيد الانتظار' :
                   order.status === 'processing' ? 'قيد المعالجة' :
                   order.status === 'shipped' ? 'تم الشحن' :
                   order.status === 'delivered' ? 'تم التوصيل' :
                   order.status === 'cancelled' ? 'ملغي' : order.status}
                </Badge>
              </TableCell>

              <TableCell>
                <Badge className={paymentStatusColors[order.payment_status]}>
                  {order.payment_status === 'pending' ? 'معلق' :
                   order.payment_status === 'completed' ? 'مكتمل' :
                   order.payment_status === 'failed' ? 'فشل' : order.payment_status}
                </Badge>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  {new Date(order.created_at).toLocaleDateString('ar-SA')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleTimeString('ar-SA', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </TableCell>
              
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="w-full"
                >
                  <Eye className="h-4 w-4 ml-2" />
                  عرض
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
          <p className="text-muted-foreground mt-2">عرض وإدارة جميع الطلبات مع معلومات الشحن الكاملة</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>قائمة الطلبات</span>
              {orders && (
                <Badge variant="outline" className="text-lg">
                  {orders.length} طلب
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Tabs defaultValue="all">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="all">الكل</TabsTrigger>
                  <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
                  <TabsTrigger value="processing">قيد المعالجة</TabsTrigger>
                  <TabsTrigger value="shipped">تم الشحن</TabsTrigger>
                  <TabsTrigger value="delivered">تم التوصيل</TabsTrigger>
                  <TabsTrigger value="cancelled">ملغي</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <OrdersTable orders={filterOrders() || []} />
                </TabsContent>
                <TabsContent value="pending">
                  <OrdersTable orders={filterOrders('pending') || []} />
                </TabsContent>
                <TabsContent value="processing">
                  <OrdersTable orders={filterOrders('processing') || []} />
                </TabsContent>
                <TabsContent value="shipped">
                  <OrdersTable orders={filterOrders('shipped') || []} />
                </TabsContent>
                <TabsContent value="delivered">
                  <OrdersTable orders={filterOrders('delivered') || []} />
                </TabsContent>
                <TabsContent value="cancelled">
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
