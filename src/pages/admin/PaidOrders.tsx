import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PaidOrders() {
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['paid-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('payment_status', 'completed')
        .neq('status', 'shipped')
        .neq('status', 'delivered')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center gap-2 lg:gap-3">
          <CreditCard className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
          <div>
            <h1 className="text-xl lg:text-3xl font-bold">الطلبات المدفوعة</h1>
            <p className="text-muted-foreground text-sm lg:text-base">الطلبات المدفوعة التي لم يتم شحنها بعد</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base lg:text-lg">
              <span>قائمة الطلبات المدفوعة</span>
              <Badge variant="outline" className="text-sm lg:text-lg">
                {orders?.length || 0} طلب
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : orders && orders.length > 0 ? (
              <>
                {/* Mobile View - Cards */}
                <div className="lg:hidden space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="hover:shadow-lg transition-all">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm font-medium">{order.order_number}</span>
                            <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">
                              مدفوع
                            </Badge>
                          </div>
                          
                          <div>
                            <div className="font-medium">{order.customer_name}</div>
                            <div className="text-xs text-muted-foreground">{order.customer_email}</div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary">{order.total_amount} ريال</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('en-GB')}
                            </span>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                            className="w-full"
                          >
                            <Eye className="h-4 w-4 ml-2" />
                            عرض التفاصيل
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden lg:block">
                  <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>حالة الطلب</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>{order.customer_email}</TableCell>
                      <TableCell>{order.total_amount} ريال</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          مدفوع
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString('en-GB')}
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
                </div>
              </>
            ) : (
              <div className="text-center p-8 text-muted-foreground text-sm lg:text-base">
                لا توجد طلبات مدفوعة
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
