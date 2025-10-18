import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ShoppingCart, Package, DollarSign, CreditCard, Clock, Truck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['sales-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('sales-stats');
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-primary opacity-20"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-12">
        <div className="animate-fade-in">
          <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-2 text-sm lg:text-lg">مرحباً بك في لوحة تحكم Seven Green</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="group relative overflow-hidden border-r-4 border-r-primary bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">مبيعات اليوم</CardTitle>
              <div className="rounded-full bg-primary/10 p-2 lg:p-3 group-hover:bg-primary/20 transition-colors">
                <DollarSign className="h-5 w-5 lg:h-8 lg:w-8 text-primary group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-3xl font-bold text-primary">{stats?.stats?.todayTotal || 0} ريال</div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-r-4 border-r-accent bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">مبيعات الأسبوع</CardTitle>
              <div className="rounded-full bg-accent/10 p-2 lg:p-3 group-hover:bg-accent/20 transition-colors">
                <TrendingUp className="h-5 w-5 lg:h-8 lg:w-8 text-accent group-hover:scale-110 group-hover:rotate-12 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-3xl font-bold text-accent">{stats?.stats?.weekTotal || 0} ريال</div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-r-4 border-r-blue-500 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">الطلبات الجديدة</CardTitle>
              <div className="rounded-full bg-blue-500/10 p-2 lg:p-3 group-hover:bg-blue-500/20 transition-colors">
                <ShoppingCart className="h-5 w-5 lg:h-8 lg:w-8 text-blue-500 group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-3xl font-bold text-blue-500">{stats?.stats?.pendingCount || 0}</div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-r-4 border-r-purple-500 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">عدد المنتجات</CardTitle>
              <div className="rounded-full bg-purple-500/10 p-2 lg:p-3 group-hover:bg-purple-500/20 transition-colors">
                <Package className="h-5 w-5 lg:h-8 lg:w-8 text-purple-500 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-3xl font-bold text-purple-500">{stats?.stats?.productsCount || 0}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="group relative overflow-hidden border-r-4 border-r-green-500 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">الطلبات المدفوعة</CardTitle>
              <div className="rounded-full bg-green-500/10 p-2 lg:p-3 group-hover:bg-green-500/20 transition-colors">
                <CreditCard className="h-5 w-5 lg:h-8 lg:w-8 text-green-600 group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-3xl font-bold text-green-600">{stats?.stats?.paidOrdersCount || 0}</div>
              <p className="text-xs lg:text-sm text-muted-foreground mt-1 lg:mt-2">طلبات تم الدفع فيها</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-r-4 border-r-yellow-500 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">في انتظار الدفع</CardTitle>
              <div className="rounded-full bg-yellow-500/10 p-2 lg:p-3 group-hover:bg-yellow-500/20 transition-colors">
                <Clock className="h-5 w-5 lg:h-8 lg:w-8 text-yellow-600 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-3xl font-bold text-yellow-600">{stats?.stats?.pendingPaymentCount || 0}</div>
              <p className="text-xs lg:text-sm text-muted-foreground mt-1 lg:mt-2">طلبات قيد انتظار الدفع</p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-r-4 border-r-blue-600 bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">الطلبات المشحونة</CardTitle>
              <div className="rounded-full bg-blue-600/10 p-2 lg:p-3 group-hover:bg-blue-600/20 transition-colors">
                <Truck className="h-5 w-5 lg:h-8 lg:w-8 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-3xl font-bold text-blue-600">{stats?.stats?.shippedCount || 0}</div>
              <p className="text-xs lg:text-sm text-muted-foreground mt-1 lg:mt-2">طلبات تم شحنها</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-r-4 border-r-primary bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.7s' }}>
          <CardHeader>
            <CardTitle className="text-base lg:text-xl">مبيعات آخر 7 أيام</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="lg:h-[300px]">
              <LineChart data={stats?.chartData || []}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-accent bg-gradient-to-br from-card to-card/50 shadow-lg hover:shadow-2xl transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <CardHeader>
            <CardTitle className="text-base lg:text-xl">آخر الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 lg:space-y-4">
              {stats?.recentOrders?.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-3 lg:pb-4 last:border-b-0 hover:bg-accent/5 p-2 rounded-lg transition-colors">
                  <div>
                    <p className="font-semibold text-sm lg:text-lg">{order.order_number}</p>
                    <p className="text-xs lg:text-sm text-muted-foreground">{order.customer_name}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm lg:text-lg text-primary">{order.total_amount} ريال</p>
                    <p className="text-xs lg:text-sm text-muted-foreground">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
