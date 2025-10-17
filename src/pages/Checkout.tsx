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
            
            {/* شعارات طرق الدفع */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h4 className="text-sm font-bold text-foreground">طرق الدفع الآمنة</h4>
              </div>
              
              <div className="grid grid-cols-5 gap-3 mb-4">
                {/* Visa */}
                <div className="bg-background rounded-xl border-2 border-border p-3 flex items-center justify-center hover:border-primary/50 transition-all hover:shadow-md h-16">
                  <svg viewBox="0 0 48 16" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.756 1.394l-5.906 13.211h-3.82L8.15 4.22c-.167-.647-.312-.885-.82-1.159C6.645 2.687 5.447 2.341 4.4 2.09l.073-.333h6.276c.8 0 1.52.533 1.702 1.454l1.555 8.26 3.84-9.714h3.91l.01-.363zM36.01 10.552c.015-3.494-4.833-3.688-4.8-5.248.01-.474.463-0.98 1.453-1.108.49-.064 1.843-.113 3.378.593l.601-2.807c-.825-.3-1.887-.588-3.208-.588-3.384 0-5.763 1.8-5.785 4.377-.022 1.905 1.7 2.968 2.997 3.602 1.332.65 1.78 1.066 1.774 1.647-.009.89-1.066 1.283-2.053 1.298-1.724.028-2.726-.465-3.524-.838l-.622 2.903c.801.368 2.282.688 3.817.705 3.599 0 5.954-1.778 5.972-4.536zM45.804 14.605h3.376L46.598 1.394h-3.116c-.7 0-1.291.406-1.552 1.031l-5.473 12.18h3.597l.715-1.977h4.392l.414 1.977h.23zm-3.827-4.689l1.8-4.96 1.036 4.96h-2.836zm-9.394-8.522l-2.83 13.211h-3.422l2.829-13.211h3.423z" fill="#1434CB"/>
                  </svg>
                </div>
                
                {/* Mastercard */}
                <div className="bg-background rounded-xl border-2 border-border p-3 flex items-center justify-center hover:border-primary/50 transition-all hover:shadow-md h-16">
                  <svg viewBox="0 0 48 32" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="16" r="12" fill="#EB001B"/>
                    <circle cx="30" cy="16" r="12" fill="#F79E1B"/>
                    <path d="M24 6.545c2.133 1.746 3.5 4.425 3.5 7.455s-1.367 5.709-3.5 7.455c-2.133-1.746-3.5-4.425-3.5-7.455s1.367-5.709 3.5-7.455z" fill="#FF5F00"/>
                  </svg>
                </div>
                
                {/* Apple Pay */}
                <div className="bg-background rounded-xl border-2 border-border p-3 flex items-center justify-center hover:border-primary/50 transition-all hover:shadow-md h-16">
                  <svg viewBox="0 0 48 20" className="w-full h-auto dark:invert" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.977 3.819c.562-.692 1.003-1.658.89-2.619-.862.035-1.914.574-2.534 1.297-.532.622-1.002 1.626-.875 2.584.925.072 1.866-.471 2.519-1.262z" fill="#000"/>
                    <path d="M11.46 7.063c-1.405 0-2.006.671-2.987.671-.999 0-1.755-.665-2.967-.665-1.565 0-3.192 1.277-3.192 3.686 0 2.371 1.86 5.032 3.381 5.032 1.062 0 1.461-.696 2.756-.696 1.278 0 1.541.69 2.95.69 1.216 0 2.121-1.412 2.916-2.804.895-1.583 1.192-3.129 1.207-3.204-.08-.023-2.332-.923-2.332-3.453 0-2.112 1.694-3.032 1.774-3.083-.965-1.431-2.469-1.585-3.006-1.606-.001.001-1.095-.107-2.5.432z" fill="#000"/>
                    <path d="M19.548 4.068h2.527c1.3 0 2.204.705 2.204 1.733 0 1.027-.904 1.733-2.204 1.733h-1.41v2.187h-1.117V4.068zm1.117 2.755h1.185c.84 0 1.314-.437 1.314-1.022 0-.586-.474-1.022-1.314-1.022h-1.185v2.044zm6.527.866c0 1.02-.772 1.671-1.95 1.671-.745 0-1.35-.316-1.65-.847l.923-.532c.172.294.496.493.788.493.511 0 .826-.257.826-.71v-.383c-.248.232-.623.383-1.092.383-.904 0-1.643-.678-1.643-1.529 0-.852.739-1.53 1.643-1.53.469 0 .844.152 1.092.384v-.316h1.063v2.916zm-1.063-1.155c0-.453-.373-.786-.88-.786s-.88.333-.88.786c0 .452.373.786.88.786s.88-.334.88-.786zm2.01 2.186l1.555-3.98h1.1l-2.076 5.062c-.382.93-.964 1.266-1.828 1.266-.172 0-.447-.024-.61-.064v-.898c.158.04.344.056.474.056.344 0 .548-.128.683-.472l.084-.208-1.966-4.742h1.125l1.459 3.98z" fill="#000"/>
                  </svg>
                </div>
                
                {/* Mada */}
                <div className="bg-background rounded-xl border-2 border-border p-3 flex items-center justify-center hover:border-primary/50 transition-all hover:shadow-md h-16">
                  <svg viewBox="0 0 48 24" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="48" height="8" fill="#0066B2"/>
                    <rect y="16" width="48" height="8" fill="#00A651"/>
                    <text x="24" y="14" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#000">مدى</text>
                  </svg>
                </div>
                
                {/* PayPal */}
                <div className="bg-background rounded-xl border-2 border-border p-3 flex items-center justify-center hover:border-primary/50 transition-all hover:shadow-md h-16">
                  <svg viewBox="0 0 48 13" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.102 1.5H3.278c-.197 0-.365.143-.396.337L1.502 10.96c-.023.147.09.28.238.28h1.381c.197 0 .365-.144.396-.338l.359-2.278c.031-.194.199-.337.396-.337h.914c1.902 0 3-.92 3.287-2.744.13-.796.005-1.422-.37-1.861-.412-.482-1.142-.731-2.11-.731l.009-.001zm.335 2.709c-.158.983-.738 1.043-1.333 1.043h-.339l.238-1.507c.014-.09.091-.156.183-.156h.154c.402 0 .782 0 .978.229.118.137.153.34.119.591z" fill="#003087"/>
                    <path d="M14.848 4.176h-1.385c-.092 0-.169.067-.183.157l-.047.298-.074-.107c-.23-.334-.743-.446-1.255-.446-1.174 0-2.177.889-2.371 2.135-.101.622.043 1.217.394 1.632.323.382.784.541 1.333.541.943 0 1.466-.606 1.466-.606l-.048.296c-.023.148.09.281.238.281h1.248c.197 0 .365-.143.396-.337l.747-4.729c-.023-.147-.09-.28-.238-.28l-.221-.035zm-1.923 2.698c-.102.604-.589 1.01-1.211 1.01-.311 0-.56-.1-.72-.29-.158-.188-.218-.456-.167-.755.095-.598.59-.997 1.201-.997.305 0 .553.101.716.293.165.194.23.465.181.739z" fill="#003087"/>
                    <path d="M21.402 4.176h-1.393c-.104 0-.201.051-.26.137l-1.502 2.212-.637-2.126c-.04-.132-.16-.223-.3-.223h-1.368c-.166 0-.284.164-.229.318l1.202 3.529-1.13 1.595c-.114.16.002.381.199.381h1.392c.103 0 .2-.05.259-.135l3.62-5.226c.112-.162-.003-.384-.2-.384l.347-.078z" fill="#003087"/>
                    <path d="M28.102 1.5h-2.824c-.197 0-.365.143-.396.337l-1.38 8.123c-.023.147.09.28.238.28h1.448c.138 0 .255-.1.276-.236l.378-2.379c.031-.194.199-.337.396-.337h.914c1.902 0 3-.92 3.287-2.744.13-.796.005-1.422-.37-1.861-.412-.482-1.142-.731-2.11-.731l.143-.452zm.335 2.709c-.158.983-.738 1.043-1.333 1.043h-.339l.238-1.507c.014-.09.091-.156.183-.156h.154c.402 0 .782 0 .978.229.118.137.153.34.119.591z" fill="#009CDE"/>
                    <path d="M36.848 4.176h-1.385c-.092 0-.169.067-.183.157l-.047.298-.074-.107c-.23-.334-.743-.446-1.255-.446-1.174 0-2.177.889-2.371 2.135-.101.622.043 1.217.394 1.632.323.382.784.541 1.333.541.943 0 1.466-.606 1.466-.606l-.048.296c-.023.148.09.281.238.281h1.248c.197 0 .365-.143.396-.337l.747-4.729c-.023-.147-.09-.28-.238-.28l-.221-.035zm-1.923 2.698c-.102.604-.589 1.01-1.211 1.01-.311 0-.56-.1-.72-.29-.158-.188-.218-.456-.167-.755.095-.598.59-.997 1.201-.997.305 0 .553.101.716.293.165.194.23.465.181.739z" fill="#009CDE"/>
                    <path d="M39.93 1.698l-1.401 8.522c-.023.148.09.281.238.281h1.191c.197 0 .365-.143.396-.337l1.38-8.124c.023-.147-.09-.28-.238-.28h-1.328c-.092 0-.169.067-.183.157l-.055.781z" fill="#009CDE"/>
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/50 rounded-xl">
                <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-xs font-medium text-green-800 dark:text-green-200">
                  SSL مشفر • حماية كاملة للبيانات
                </span>
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
