import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { useNavigate } from '@/hooks/useNextRouter';

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

export default function PendingPaymentOrders() {
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['pending-payment-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center gap-2 lg:gap-3">
          <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-yellow-600" />
          <div>
            <h1 className="text-xl lg:text-3xl font-bold">الطلبات قيد انتظار الدفع</h1>
            <p className="text-muted-foreground text-sm lg:text-base">الطلبات التي لم يتم الدفع فيها بعد</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base lg:text-lg">
              <span>قائمة الطلبات قيد الانتظار</span>
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
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 text-xs">
                              قيد الانتظار
                            </Badge>
                          </div>
                          
                          <div>
                            <div className="font-medium">{order.customer_name}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Phone className="h-3 w-3" />
                              <span>{order.customer_phone}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{COUNTRIES[order.country_code] || order.country_code} - {order.city}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary">{order.total_amount.toFixed(2)} ریال</span>
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
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">رقم الطلب</TableHead>
                      <TableHead className="min-w-[150px]">معلومات العميل</TableHead>
                      <TableHead className="min-w-[200px]">معلومات الشحن</TableHead>
                      <TableHead className="min-w-[100px]">المبلغ</TableHead>
                      <TableHead className="min-w-[120px]">حالة الطلب</TableHead>
                      <TableHead className="min-w-[100px]">التاريخ</TableHead>
                      <TableHead className="min-w-[100px]">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
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
                            {order.total_amount.toFixed(2)} ریال
                          </div>
                          {order.shipping_fee > 0 && (
                            <div className="text-xs text-muted-foreground">
                              شحن: {order.shipping_fee.toFixed(2)} ريال
                            </div>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            {order.status === 'pending' ? 'قيد الانتظار' :
                             order.status === 'processing' ? 'قيد المعالجة' :
                             order.status === 'shipped' ? 'تم الشحن' :
                             order.status === 'delivered' ? 'تم التوصيل' :
                             order.status === 'cancelled' ? 'ملغي' : order.status}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm">
                            {new Date(order.created_at).toLocaleDateString('en-GB')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleTimeString('en-GB', { 
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
              </>
            ) : (
              <div className="text-center p-8 text-muted-foreground text-sm lg:text-base">
                لا توجد طلبات قيد انتظار الدفع
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
