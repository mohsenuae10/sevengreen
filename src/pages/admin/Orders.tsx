import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>رقم الطلب</TableHead>
          <TableHead>اسم العميل</TableHead>
          <TableHead>البريد الإلكتروني</TableHead>
          <TableHead>المبلغ</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead>التاريخ</TableHead>
          <TableHead>الإجراءات</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders?.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.order_number}</TableCell>
            <TableCell>{order.customer_name}</TableCell>
            <TableCell>{order.customer_email}</TableCell>
            <TableCell>{order.total_amount} ريال</TableCell>
            <TableCell>
              <Badge className={statusColors[order.status]}>
                {order.status}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(order.created_at).toLocaleDateString('ar-SA')}
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/orders/${order.id}`)}
              >
                <Eye className="h-4 w-4 ml-2" />
                عرض
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">إدارة الطلبات</h1>

        <Card>
          <CardHeader>
            <CardTitle>قائمة الطلبات</CardTitle>
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
