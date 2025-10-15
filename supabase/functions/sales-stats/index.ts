import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get start of week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    // Get start of month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Total sales today
    const { data: todaySales } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', today.toISOString())
      .eq('payment_status', 'paid');

    const todayTotal = todaySales?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

    // Total sales this week
    const { data: weekSales } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', startOfWeek.toISOString())
      .eq('payment_status', 'paid');

    const weekTotal = weekSales?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

    // Total sales this month
    const { data: monthSales } = await supabase
      .from('orders')
      .select('total_amount')
      .gte('created_at', startOfMonth.toISOString())
      .eq('payment_status', 'paid');

    const monthTotal = monthSales?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

    // Total revenue
    const { data: allSales } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('payment_status', 'paid');

    const totalRevenue = allSales?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

    // Count of pending orders
    const { count: pendingCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Count of products
    const { count: productsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Count of paid orders
    const { count: paidOrdersCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'paid');

    // Count of pending payment orders
    const { count: pendingPaymentCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'pending');

    // Count of shipped orders
    const { count: shippedCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'shipped');

    // Sales chart data (last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const { data: daySales } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString())
        .eq('payment_status', 'paid');

      const dayTotal = daySales?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      chartData.push({
        date: date.toLocaleDateString('ar-SA', { weekday: 'short' }),
        amount: dayTotal,
      });
    }

    // Recent orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    return new Response(
      JSON.stringify({
        stats: {
          todayTotal,
          weekTotal,
          monthTotal,
          totalRevenue,
          pendingCount: pendingCount || 0,
          productsCount: productsCount || 0,
          paidOrdersCount: paidOrdersCount || 0,
          pendingPaymentCount: pendingPaymentCount || 0,
          shippedCount: shippedCount || 0,
        },
        chartData,
        recentOrders,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in sales-stats:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
