import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';

// Initialize Stripe - Make sure VITE_STRIPE_PUBLISHABLE_KEY is set in .env
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error('⚠️ VITE_STRIPE_PUBLISHABLE_KEY is not set in .env file');
}

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface CheckoutFormProps {
  clientSecret: string;
  orderId: string;
  orderNumber: string;
}

function CheckoutForm({ clientSecret, orderId, orderNumber }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSuccess = async () => {
    try {
      // Update order status
      await supabase
        .from('orders')
        .update({ payment_status: 'completed' })
        .eq('id', orderId);

      // Send confirmation email
      await supabase.functions.invoke('send-order-confirmation', {
        body: { order_id: orderId },
      });

      clearCart();
      navigate(`/order-success/${orderId}`);
    } catch (error) {
      console.error('Error after payment:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-success/${orderId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: 'خطأ في الدفع',
          description: error.message,
          variant: 'destructive',
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        await handlePaymentSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء معالجة الدفع',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExpressPayment = async (event: any) => {
    if (!stripe) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements: elements!,
        confirmParams: {
          return_url: `${window.location.origin}/order-success/${orderId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: 'خطأ في الدفع',
          description: error.message,
          variant: 'destructive',
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        await handlePaymentSuccess();
      }
    } catch (error) {
      console.error('Express payment error:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء معالجة الدفع',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Express Checkout (Apple Pay / Google Pay) */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px bg-border flex-1" />
          <span className="text-sm text-muted-foreground">الدفع السريع</span>
          <div className="h-px bg-border flex-1" />
        </div>
        
        <ExpressCheckoutElement
          onConfirm={handleExpressPayment}
          options={{
            buttonHeight: 48,
            buttonTheme: {
              applePay: 'black',
              googlePay: 'black',
            },
            layout: {
              maxColumns: 1,
              overflow: 'never',
            },
          }}
        />
      </div>
      
      {/* فاصل */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-4 text-muted-foreground">أو</span>
        </div>
      </div>
      
      {/* Standard Payment Methods */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-bold mb-4">معلومات الدفع</h3>
          <PaymentElement />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري المعالجة...
            </>
          ) : (
            'إتمام الدفع'
          )}
        </Button>
      </form>
    </div>
  );
}

export default function Checkout() {
  const { items, totalPrice } = useCart();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    city: '',
    shipping_address: '',
    notes: '',
  });

  if (items.length === 0 && !clientSecret) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_name || !formData.customer_email || !formData.customer_phone || !formData.city || !formData.shipping_address) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          ...formData,
          items: items.map(item => ({
            id: item.id,
            name_ar: item.name_ar,
            price: item.price,
            quantity: item.quantity,
          })),
          shipping_fee: 0, // Can be calculated based on city
        },
      });

      if (error) throw error;

      setClientSecret(data.client_secret);
      setOrderId(data.order_id);
      setOrderNumber(data.order_number);

      toast({
        title: 'تم إنشاء الطلب',
        description: 'الآن قم بإتمام عملية الدفع',
      });
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إنشاء الطلب',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary mb-8">إتمام الطلب</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {!clientSecret ? (
            <Card>
              <CardHeader>
                <CardTitle>معلومات الشحن</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateOrder} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer_name">الاسم الكامل *</Label>
                      <Input
                        id="customer_name"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customer_phone">رقم الهاتف *</Label>
                      <Input
                        id="customer_phone"
                        name="customer_phone"
                        type="tel"
                        value={formData.customer_phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_email">البريد الإلكتروني *</Label>
                    <Input
                      id="customer_email"
                      name="customer_email"
                      type="email"
                      value={formData.customer_email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">المدينة *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shipping_address">العنوان الكامل *</Label>
                    <Textarea
                      id="shipping_address"
                      name="shipping_address"
                      value={formData.shipping_address}
                      onChange={handleInputChange}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={2}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري المعالجة...
                      </>
                    ) : (
                      'متابعة للدفع'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>الدفع الآمن</CardTitle>
              </CardHeader>
              <CardContent>
                {!stripePromise ? (
                  <div className="p-6 text-center space-y-4">
                    <div className="text-destructive">
                      ⚠️ خطأ في تهيئة نظام الدفع
                    </div>
                    <p className="text-sm text-muted-foreground">
                      يرجى التواصل مع الدعم الفني
                    </p>
                  </div>
                ) : (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: 'stripe',
                      },
                      locale: 'ar',
                    }}
                  >
                    <CheckoutForm
                      clientSecret={clientSecret}
                      orderId={orderId!}
                      orderNumber={orderNumber!}
                    />
                  </Elements>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name_ar} × {item.quantity}
                    </span>
                    <span>{(item.price * item.quantity).toFixed(2)} ريال</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span>{totalPrice.toFixed(2)} ريال</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">رسوم الشحن</span>
                  <span>0.00 ريال</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span className="text-primary">{totalPrice.toFixed(2)} ريال</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
