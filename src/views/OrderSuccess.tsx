import { useEffect, useState } from 'react';
import { useParams, Link } from '@/hooks/useNextRouter';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Package, Loader2 } from 'lucide-react';
import { SEOHead } from '@/components/SEO/SEOHead';
import Head from 'next/head';
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';
import { trackPurchase } from '@/lib/meta-pixel';

export default function OrderSuccess() {
  const { orderId } = useParams<{ orderId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [paymentUpdated, setPaymentUpdated] = useState(false);
  const { t, language, getLocalizedPath, formatPrice } = useLanguageCurrency();

  // تحديث حالة الدفع فور الوصول للصفحة (بعد redirect من Stripe)
  useEffect(() => {
    const updatePaymentStatus = async () => {
      if (!orderId || paymentUpdated) return;

      const urlParams = new URLSearchParams(window.location.search);
      const paymentIntentId = urlParams.get('payment_intent');
      const paymentIntentClientSecret = urlParams.get('payment_intent_client_secret');
      const paymentMethod = urlParams.get('payment_method');

      console.log('🔍 Checking URL parameters:', {
        paymentIntentId,
        hasSecret: !!paymentIntentClientSecret,
        paymentMethod,
        orderId
      });

      // إذا كنا قادمين من redirect (يوجد payment_intent في URL)
      if (paymentIntentId && paymentIntentClientSecret) {
        console.log('✅ Payment completed via redirect, updating order status...');
        
        try {
          // تحديث حالة الدفع إلى completed
          const { error: updateError } = await supabase
            .from('orders')
            .update({ payment_status: 'completed' })
            .eq('id', orderId);

          if (updateError) {
            console.error('❌ Error updating payment status:', updateError);
          } else {
            console.log('✅ Payment status updated to completed');
            setPaymentUpdated(true);

            // إرسال بريد تأكيد الطلب
            try {
              await supabase.functions.invoke('send-order-confirmation', {
                body: { order_id: orderId },
              });
              console.log('✅ Confirmation email sent');
            } catch (emailError) {
              console.error('❌ Error sending confirmation email:', emailError);
            }

            // إرسال بريد تأكيد الدفع
            try {
              await supabase.functions.invoke('send-payment-confirmed', {
                body: { order_id: orderId },
              });
              console.log('✅ Payment confirmation email sent');
            } catch (emailError) {
              console.error('❌ Error sending payment confirmation email:', emailError);
            }
          }
        } catch (error) {
          console.error('❌ Exception updating payment:', error);
        }
      }
    };

    updatePaymentStatus();
  }, [orderId, paymentUpdated]);

  const { data: order, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      console.log('📦 Fetching order:', orderId, '(Attempt:', retryCount + 1, ')');
      
      // استخدام edge function للحصول على بيانات الطلب
      const { data, error } = await supabase.functions.invoke('get-order-details', {
        body: { order_id: orderId },
      });
      
      if (error) {
        console.error('❌ Error fetching order:', error);
        throw error;
      }
      
      console.log('✅ Order fetched:', data);
      console.log('Payment status:', data.payment_status);
      console.log('Stripe payment ID:', data.stripe_payment_id);

      // Meta Pixel: Purchase
      if (data && data.order_items) {
        trackPurchase({
          content_ids: data.order_items.map((item: any) => item.product_id || item.id),
          content_type: 'product',
          value: data.total_amount,
          currency: 'SAR',
          num_items: data.order_items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0),
          order_id: data.order_number || orderId,
        });
      }
      
      setIsLoading(false);
      return data;
    },
    enabled: !!orderId,
    retry: 3,
    retryDelay: 1000,
  });

  // إعادة المحاولة تلقائياً إذا لم يتم العثور على الطلب
  useEffect(() => {
    if (!order && !isLoading && retryCount < 3) {
      console.log('🔄 Retrying to fetch order...');
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        refetch();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [order, isLoading, retryCount, refetch]);

  if (isLoading) {
    return (
      <>
        <SEOHead
          title={t('orderSuccess.loadingTitle')}
          description={t('orderSuccess.loadingDesc')}
        />
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">{t('orderSuccess.loadingDetails')}</p>
            {retryCount > 0 && (
              <p className="text-sm text-muted-foreground">
                {t('orderSuccess.attempt', { current: retryCount + 1, total: 3 })}
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <SEOHead
          title={t('orderSuccess.notFoundTitle')}
          description={t('orderSuccess.notFoundDesc')}
        />
        <Head>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">{t('orderSuccess.notFoundTitle')}</h2>
            <Button asChild>
              <Link to={getLocalizedPath('/')}>{t('orderSuccess.backToHome')}</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={t('orderSuccess.successTitle')}
        description={t('orderSuccess.successDesc')}
      />
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-primary">{t('orderSuccess.orderReceived')}</h1>
          <p className="text-muted-foreground">
            {t('orderSuccess.thankYou')}
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <Package className="h-6 w-6 text-primary mt-1" />
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">{t('orderSuccess.orderDetails')}</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('orderSuccess.orderNumber')}</span>
                    <span className="font-medium">{order.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('orderSuccess.date')}</span>
                    <span className="font-medium">
                      {new Date(order.created_at).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('orderSuccess.email')}</span>
                    <span className="font-medium">{order.customer_email}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold mb-3">{t('orderSuccess.orderedProducts')}</h3>
              <div className="space-y-2">
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.total_price)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>{t('orderSuccess.total')}</span>
                <span className="text-primary">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-secondary/30 rounded-lg p-6 mb-6">
          <h3 className="font-bold mb-2">{t('orderSuccess.whatsNext')}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• {t('orderSuccess.confirmationEmail')}</li>
            <li>• {t('orderSuccess.processingTime')}</li>
            <li>• {t('orderSuccess.trackingNumber')}</li>
          </ul>
        </div>

        <div className="flex gap-4">
          <Button asChild size="lg" className="flex-1">
            <Link to={getLocalizedPath('/')}>{t('orderSuccess.backToHome')}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="flex-1">
            <Link to={getLocalizedPath('/products')}>{t('orderSuccess.continueShopping')}</Link>
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
