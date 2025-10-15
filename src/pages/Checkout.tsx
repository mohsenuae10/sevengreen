import { useState, useEffect } from 'react';
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
import { Loader2, ShoppingBag } from 'lucide-react';

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
  const [expressAvailable, setExpressAvailable] = useState<boolean | null>(null);

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
    <div className="space-y-8">
      {/* Express Checkout Section - Apple Pay / Google Pay */}
      <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-6 border-2 border-primary/20 transition-all duration-300 hover:shadow-xl hover:border-primary/30">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-foreground mb-2">الدفع السريع</h3>
          <p className="text-sm text-muted-foreground">ادفع بأمان باستخدام Apple Pay أو Google Pay</p>
        </div>
        
        <ExpressCheckoutElement
          onReady={({ availablePaymentMethods }) => {
            console.log('🔍 Express Checkout Ready');
            console.log('Available methods:', availablePaymentMethods);
            
            const hasExpress = availablePaymentMethods && 
              (availablePaymentMethods.applePay || availablePaymentMethods.googlePay);
            setExpressAvailable(hasExpress || false);
            
            if (!hasExpress) {
              console.warn('⚠️ No express payment methods available');
              console.warn('Check: HTTPS, Apple Wallet, Currency (SAR), Device/Browser');
            }
          }}
          onLoadError={(error) => {
            console.error('❌ Express Checkout Error:', error);
            setExpressAvailable(false);
          }}
          onConfirm={handleExpressPayment}
          options={{
            buttonHeight: 55,
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
        
        {expressAvailable === false && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-center animate-fade-in">
            <div className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-1">
              Apple Pay غير متاح حالياً
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-300">
              يرجى استخدام بطاقة الائتمان أدناه
            </div>
          </div>
        )}
      </div>
      
      {/* فاصل أنيق */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-6 py-2 text-sm font-medium text-muted-foreground rounded-full border border-border">
            أو ادفع بالبطاقة
          </span>
        </div>
      </div>
      
      {/* Card Payment Section */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gradient-to-br from-background to-muted/20 border-2 border-border rounded-xl p-5 transition-all duration-300 hover:border-primary/30">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">معلومات البطاقة</h3>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">نقبل</div>
                <div className="flex gap-1.5">
                  <div className="w-10 h-6 bg-white rounded border border-border flex items-center justify-center text-[10px] font-bold text-blue-600">
                    VISA
                  </div>
                  <div className="w-10 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded border border-border flex items-center justify-center">
                    <div className="flex gap-0.5">
                      <div className="w-2 h-2 bg-red-600/80 rounded-full" />
                      <div className="w-2 h-2 bg-orange-400/80 rounded-full" />
                    </div>
                  </div>
                  <div className="w-10 h-6 bg-gradient-to-br from-blue-500 to-blue-700 rounded border border-border flex items-center justify-center text-[8px] font-bold text-white">
                    AMEX
                  </div>
                  <div className="w-10 h-6 bg-gradient-to-br from-purple-600 to-orange-400 rounded border border-border" />
                </div>
              </div>
            </div>
            
            <div className="bg-background border border-border rounded-xl p-4">
              <PaymentElement 
                options={{
                  layout: {
                    type: 'accordion',
                    defaultCollapsed: false,
                    radios: true,
                    spacedAccordionItems: true,
                  }
                }}
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              جاري المعالجة...
            </>
          ) : (
            <>
              إتمام الدفع الآمن
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </>
          )}
        </Button>
        
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span>الدفع مشفر بالكامل وآمن بنسبة 100%</span>
        </div>
      </form>
    </div>
  );
}

export default function Checkout() {
  const { items, totalPrice } = useCart();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
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

  // Debug logging
  useEffect(() => {
    console.log('═══════════════════════════════════');
    console.log('🛒 Checkout Page Debug Info');
    console.log('═══════════════════════════════════');
    console.log('📦 Items in cart:', items.length);
    console.log('💰 Total price:', totalPrice, 'SAR');
    console.log('🔐 Client secret:', clientSecret ? '✅ Yes' : '❌ No');
    console.log('🔑 Stripe key:', stripePublishableKey ? '✅ Set' : '❌ Missing');
    console.log('🌐 Current URL:', window.location.href);
    console.log('🔒 Is HTTPS:', window.location.protocol === 'https:');
    console.log('═══════════════════════════════════');
  }, [items, totalPrice, clientSecret]);

  // Handle empty cart with delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
      
      if (items.length === 0 && !clientSecret) {
        toast({
          title: 'السلة فارغة',
          description: 'يرجى إضافة منتجات للسلة أولاً',
          variant: 'destructive',
        });
        navigate('/cart');
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [items.length, clientSecret, navigate]);

  if (isInitializing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="mr-3 text-muted-foreground">جاري التحميل...</span>
        </div>
      </div>
    );
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
          <Card className="sticky top-20 shadow-xl border-2">
            <CardHeader className="bg-gradient-to-br from-primary/5 to-primary/10">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                ملخص الطلب
              </CardTitle>
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
