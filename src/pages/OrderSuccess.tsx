import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Package } from 'lucide-react';

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const [isLoading, setIsLoading] = useState(true);

  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      setIsLoading(false);
      return data;
    },
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">الطلب غير موجود</h2>
          <Button asChild>
            <Link to="/">العودة للرئيسية</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary">تم استلام طلبك بنجاح!</h1>
          <p className="text-muted-foreground">
            شكراً لك على الطلب. سيتم معالجته في أقرب وقت ممكن.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <Package className="h-6 w-6 text-primary mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">تفاصيل الطلب</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">رقم الطلب:</span>
                    <span className="font-medium">{order.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">التاريخ:</span>
                    <span className="font-medium">
                      {new Date(order.created_at).toLocaleString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">البريد الإلكتروني:</span>
                    <span className="font-medium">{order.customer_email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold mb-3">المنتجات المطلوبة</h3>
              <div className="space-y-2">
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span>{item.total_price.toFixed(2)} ريال</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>الإجمالي</span>
                <span className="text-primary">{order.total_amount.toFixed(2)} ريال</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-secondary/30 rounded-lg p-6 mb-6">
          <h3 className="font-bold mb-2">ماذا بعد؟</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• ستصلك رسالة تأكيد عبر البريد الإلكتروني</li>
            <li>• سيتم معالجة طلبك خلال 1-2 يوم عمل</li>
            <li>• سنرسل لك رقم تتبع الشحنة عبر البريد الإلكتروني</li>
          </ul>
        </div>

        <div className="flex gap-4">
          <Button asChild size="lg" className="flex-1">
            <Link to="/">العودة للرئيسية</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1">
            <Link to="/products">متابعة التسوق</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
