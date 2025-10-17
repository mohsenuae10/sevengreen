import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, ExpressCheckoutElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, ShoppingBag, CreditCard, Lock, ShieldCheck, Package, MapPin, Mail, Phone, User, FileText, Globe } from 'lucide-react';
import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';

// قائمة الدول العربية ودول الخليج
const ARAB_COUNTRIES = [
  { code: 'SA', name: 'السعودية', dialCode: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'الإمارات', dialCode: '+971', flag: '🇦🇪' },
  { code: 'KW', name: 'الكويت', dialCode: '+965', flag: '🇰🇼' },
  { code: 'QA', name: 'قطر', dialCode: '+974', flag: '🇶🇦' },
  { code: 'BH', name: 'البحرين', dialCode: '+973', flag: '🇧🇭' },
  { code: 'OM', name: 'عمان', dialCode: '+968', flag: '🇴🇲' },
  { code: 'JO', name: 'الأردن', dialCode: '+962', flag: '🇯🇴' },
  { code: 'LB', name: 'لبنان', dialCode: '+961', flag: '🇱🇧' },
  { code: 'EG', name: 'مصر', dialCode: '+20', flag: '🇪🇬' },
  { code: 'IQ', name: 'العراق', dialCode: '+964', flag: '🇮🇶' },
  { code: 'SY', name: 'سوريا', dialCode: '+963', flag: '🇸🇾' },
  { code: 'YE', name: 'اليمن', dialCode: '+967', flag: '🇾🇪' },
  { code: 'MA', name: 'المغرب', dialCode: '+212', flag: '🇲🇦' },
  { code: 'DZ', name: 'الجزائر', dialCode: '+213', flag: '🇩🇿' },
  { code: 'TN', name: 'تونس', dialCode: '+216', flag: '🇹🇳' },
  { code: 'LY', name: 'ليبيا', dialCode: '+218', flag: '🇱🇾' },
  { code: 'SD', name: 'السودان', dialCode: '+249', flag: '🇸🇩' },
  { code: 'PS', name: 'فلسطين', dialCode: '+970', flag: '🇵🇸' },
];

// Production domain for Stripe
const PRODUCTION_DOMAIN = 'https://sevengreenstore.com';

// Initialize Stripe
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
      await supabase
        .from('orders')
        .update({ payment_status: 'completed' })
        .eq('id', orderId);

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
          return_url: `${PRODUCTION_DOMAIN}/order-success/${orderId}`,
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
      console.error('❌ Stripe not initialized');
      return;
    }

    console.log('🍏 Apple Pay: Starting payment process');
    console.log('🍏 Order ID:', orderId);
    setIsProcessing(true);

    try {
      console.log('🍏 Apple Pay: Confirming payment...');
      
      // استخدام redirect: 'always' للتأكد من أننا نذهب إلى صفحة النجاح
      const { error } = await stripe.confirmPayment({
        elements: elements!,
        confirmParams: {
          return_url: `${PRODUCTION_DOMAIN}/order-success/${orderId}?payment_method=apple_pay`,
        },
        redirect: 'always', // تأكد من الانتقال دائماً
      });

      // هذا السطر لن يتم الوصول إليه إلا في حالة خطأ (لأن redirect: 'always')
      if (error) {
        console.error('❌ Apple Pay error:', error);
        toast({
          title: 'خطأ في الدفع',
          description: error.message,
          variant: 'destructive',
        });
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('❌ Apple Pay exception:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء معالجة الدفع',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Express Checkout - Premium Modern Design */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-8 border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 left-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-4">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">الدفع السريع والآمن</h3>
            <p className="text-sm text-muted-foreground">ادفع بسرعة وأمان باستخدام Apple Pay أو Google Pay</p>
          </div>
          
          <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
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
          </div>
          
          {expressAvailable === false && (
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-center backdrop-blur-sm">
              <div className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-1">
                الدفع السريع غير متاح حالياً
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-300">
                استخدم بطاقة الائتمان أدناه للمتابعة
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Elegant Divider */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-dashed border-border"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-6 py-2 text-sm font-bold text-muted-foreground rounded-full border-2 border-border shadow-sm">
            أو ادفع بالبطاقة
          </span>
        </div>
      </div>
      
      {/* Card Payment - Premium Design */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-card border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative z-10 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">معلومات البطاقة</h3>
                  <p className="text-xs text-muted-foreground">جميع المعلومات محمية ومشفرة</p>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/30 backdrop-blur-sm rounded-xl p-5 border border-border/50">
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
          className="w-full h-16 text-lg font-bold rounded-xl bg-gradient-to-l from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary/95 hover:to-primary shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
          disabled={!stripe || isProcessing}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          {isProcessing ? (
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>جاري المعالجة الآمنة...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5" />
              <span>إتمام الدفع الآمن</span>
              <ShieldCheck className="h-5 w-5" />
            </div>
          )}
        </Button>
        
        <div className="flex items-center justify-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/50 rounded-xl">
          <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            الدفع مشفر بالكامل وآمن بنسبة 100%
          </span>
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
    country_code: 'SA',
    city: '',
    shipping_address: '',
    notes: '',
  });

  const selectedCountry = ARAB_COUNTRIES.find(c => c.code === formData.country_code) || ARAB_COUNTRIES[0];

  // Check for Stripe redirect with payment_intent
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntentId = urlParams.get('payment_intent');
    const paymentIntentClientSecret = urlParams.get('payment_intent_client_secret');
    
    if (paymentIntentId && paymentIntentClientSecret) {
      console.log('🔄 Returned from Stripe redirect');
      console.log('Payment Intent ID:', paymentIntentId);
      
      // تحديث حالة الطلب تلقائياً
      const updateOrderStatus = async () => {
        try {
          const { data: orders } = await supabase
            .from('orders')
            .select('id')
            .eq('stripe_payment_id', paymentIntentId)
            .single();
          
          if (orders) {
            await supabase
              .from('orders')
              .update({ payment_status: 'completed' })
              .eq('id', orders.id);
            
            navigate(`/order-success/${orders.id}`);
          }
        } catch (error) {
          console.error('Error updating order after redirect:', error);
        }
      };
      
      updateOrderStatus();
    }
  }, [navigate]);

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
    console.log('🎯 Production Domain:', PRODUCTION_DOMAIN);
    console.log('🔒 Is HTTPS:', window.location.protocol === 'https:');
    console.log('🍏 Apple Pay Domain:', window.location.hostname);
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
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: `${selectedCountry.dialCode}${formData.customer_phone}`,
          city: formData.city,
          shipping_address: formData.shipping_address,
          notes: formData.notes,
          items: items.map(item => ({
            id: item.id,
            name_ar: item.name_ar,
            price: item.price,
            quantity: item.quantity,
          })),
          shipping_fee: 0,
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
    <>
      <SEOHead
        title="إتمام الطلب"
        description="أكمل طلبك من سفن جرين للمنتجات الطبيعية"
      />
      <BreadcrumbSchema
        items={[
          { name: 'الرئيسية', url: '/' },
          { name: 'سلة التسوق', url: '/cart' },
          { name: 'إتمام الطلب', url: '/checkout' },
        ]}
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-l from-primary via-primary to-primary/80 bg-clip-text text-transparent mb-2">
            إتمام الطلب
          </h1>
          <p className="text-muted-foreground">أكمل بياناتك لإتمام عملية الشراء الآمنة</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {!clientSecret ? (
              <div className="relative overflow-hidden rounded-2xl bg-card border-2 border-border shadow-lg">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl"></div>
                
                <div className="relative z-10 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">معلومات الشحن</h2>
                      <p className="text-sm text-muted-foreground">أدخل عنوانك لإتمام التوصيل</p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateOrder} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="customer_name" className="flex items-center gap-2 text-sm font-medium">
                          <User className="h-4 w-4 text-primary" />
                          الاسم الكامل *
                        </Label>
                        <Input
                          id="customer_name"
                          name="customer_name"
                          value={formData.customer_name}
                          onChange={handleInputChange}
                          required
                          className="h-12 rounded-xl border-2 focus:border-primary transition-colors"
                          placeholder="أدخل اسمك الكامل"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country_code" className="flex items-center gap-2 text-sm font-medium">
                          <Globe className="h-4 w-4 text-primary" />
                          الدولة *
                        </Label>
                        <Select
                          value={formData.country_code}
                          onValueChange={(value) => setFormData({ ...formData, country_code: value })}
                        >
                          <SelectTrigger className="h-12 rounded-xl border-2 focus:border-primary transition-colors bg-background">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{selectedCountry.flag}</span>
                                <span>{selectedCountry.name}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-background border-2 max-h-[300px] z-[100]">
                            {ARAB_COUNTRIES.map((country) => (
                              <SelectItem 
                                key={country.code} 
                                value={country.code}
                                className="cursor-pointer hover:bg-accent focus:bg-accent"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{country.flag}</span>
                                  <span className="font-medium">{country.name}</span>
                                  <span className="text-muted-foreground text-sm">({country.dialCode})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customer_phone" className="flex items-center gap-2 text-sm font-medium">
                        <Phone className="h-4 w-4 text-primary" />
                        رقم الهاتف *
                      </Label>
                      <div className="relative">
                        <div className="absolute left-0 top-0 h-12 px-4 bg-muted/50 rounded-l-xl border-2 border-r-0 border-border flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">{selectedCountry.dialCode.replace('+', '')}</span>
                          <span className="text-xl">{selectedCountry.flag}</span>
                        </div>
                        <Input
                          id="customer_phone"
                          name="customer_phone"
                          type="tel"
                          value={formData.customer_phone}
                          onChange={handleInputChange}
                          required
                          className="h-12 rounded-xl border-2 focus:border-primary transition-colors pl-32"
                          placeholder="5xxxxxxxx"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customer_email" className="flex items-center gap-2 text-sm font-medium">
                        <Mail className="h-4 w-4 text-primary" />
                        البريد الإلكتروني *
                      </Label>
                      <Input
                        id="customer_email"
                        name="customer_email"
                        type="email"
                        value={formData.customer_email}
                        onChange={handleInputChange}
                        required
                        className="h-12 rounded-xl border-2 focus:border-primary transition-colors"
                        placeholder="example@email.com"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="flex items-center gap-2 text-sm font-medium">
                          <MapPin className="h-4 w-4 text-primary" />
                          المدينة *
                        </Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="h-12 rounded-xl border-2 focus:border-primary transition-colors"
                          placeholder="المدينة"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shipping_address" className="flex items-center gap-2 text-sm font-medium">
                          <MapPin className="h-4 w-4 text-primary" />
                          الحي *
                        </Label>
                        <Input
                          id="shipping_address"
                          name="shipping_address"
                          value={formData.shipping_address}
                          onChange={handleInputChange}
                          required
                          className="h-12 rounded-xl border-2 focus:border-primary transition-colors"
                          placeholder="اسم الحي أو المنطقة"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4 text-primary" />
                        ملاحظات إضافية (اختياري)
                      </Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={2}
                        className="rounded-xl border-2 focus:border-primary transition-colors resize-none"
                        placeholder="أي تعليمات خاصة للتوصيل..."
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-14 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                          جاري المعالجة...
                        </>
                      ) : (
                        <>
                          متابعة للدفع
                          <CreditCard className="mr-2 h-5 w-5" />
                        </>
                      )}
                    </Button>

                  </form>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-2xl bg-card border-2 border-border shadow-lg">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/5 to-transparent rounded-full blur-3xl"></div>
                
                <div className="relative z-10 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">الدفع الآمن</h2>
                      <p className="text-sm text-muted-foreground">أكمل عملية الدفع بأمان تام</p>
                    </div>
                  </div>

                  {!stripePromise ? (
                    <div className="p-8 text-center space-y-4 bg-destructive/10 rounded-xl border-2 border-destructive/20">
                      <div className="text-destructive text-lg font-bold">
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
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="relative overflow-hidden rounded-2xl bg-card border-2 border-border shadow-xl">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/10 to-accent/10"></div>
                
                <div className="relative z-10">
                  <div className="p-6 bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">ملخص الطلب</h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-start gap-3 flex-1">
                            {item.image_url && (
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-background border border-border flex-shrink-0">
                                <img 
                                  src={item.image_url} 
                                  alt={item.name_ar}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm mb-1 line-clamp-2">{item.name_ar}</div>
                              <div className="text-xs text-muted-foreground">الكمية: {item.quantity}</div>
                            </div>
                          </div>
                          <span className="font-bold text-primary whitespace-nowrap">{(item.price * item.quantity).toFixed(2)} ريال</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t-2 border-dashed border-border pt-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-medium">المجموع الفرعي</span>
                        <span className="font-bold">{totalPrice.toFixed(2)} ريال</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-medium">رسوم الشحن</span>
                        <span className="font-bold text-green-600">مجاناً</span>
                      </div>
                    </div>

                    <div className="border-t-2 border-border pt-4 bg-primary/5 -mx-6 px-6 py-4 rounded-b-2xl">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-foreground">الإجمالي</span>
                        <span className="text-2xl font-bold text-primary">{totalPrice.toFixed(2)} ريال</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
