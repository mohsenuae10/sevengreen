import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, CreditCard, ArrowRight } from 'lucide-react';
import { OptimizedImage } from '@/components/OptimizedImage';

export default function QuickCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('productId');
  const quantity = parseInt(searchParams.get('quantity') || '1');

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    city: '',
    shipping_address: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) throw new Error('Product ID is required');
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });

  useEffect(() => {
    if (!productId) {
      toast({
        title: 'خطأ',
        description: 'لم يتم تحديد المنتج',
        variant: 'destructive',
      });
      navigate('/products');
    }
  }, [productId, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من الحقول
    if (!formData.customer_name.trim()) {
      toast({
        title: 'خطأ',
        description: 'يجب إدخال الاسم',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.customer_email.trim()) {
      toast({
        title: 'خطأ',
        description: 'يجب إدخال البريد الإلكتروني',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.customer_phone.trim()) {
      toast({
        title: 'خطأ',
        description: 'يجب إدخال رقم الهاتف',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.city.trim()) {
      toast({
        title: 'خطأ',
        description: 'يجب إدخال المدينة',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.shipping_address.trim()) {
      toast({
        title: 'خطأ',
        description: 'يجب إدخال العنوان',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // استدعاء edge function للدفع
      const { data, error } = await supabase.functions.invoke('create-product-checkout', {
        body: {
          productId: productId,
          quantity: quantity,
          customerInfo: formData,
        },
      });

      if (error) throw error;

      if (data?.url) {
        // التحويل إلى صفحة الدفع في Stripe
        window.location.href = data.url;
      } else {
        throw new Error('لم يتم الحصول على رابط الدفع');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'خطأ في الدفع',
        description: error instanceof Error ? error.message : 'فشل إنشاء جلسة الدفع',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
        <Button onClick={() => navigate('/products')}>
          العودة للمنتجات
        </Button>
      </div>
    );
  }

  const totalPrice = (Number(product.price) * quantity).toFixed(2);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">إتمام الطلب</h1>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* ملخص الطلب */}
        <Card>
          <CardHeader>
            <CardTitle>ملخص الطلب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <OptimizedImage
                src={product.image_url || ''}
                alt={product.name_ar}
                className="w-24 h-24 rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{product.name_ar}</h3>
                <p className="text-muted-foreground">{product.category}</p>
                <p className="text-sm mt-2">
                  الكمية: <span className="font-semibold">{quantity}</span>
                </p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span>السعر للوحدة:</span>
                <span className="font-semibold">{Number(product.price).toFixed(2)} ريال</span>
              </div>
              <div className="flex justify-between">
                <span>الكمية:</span>
                <span className="font-semibold">{quantity}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>المجموع:</span>
                <span className="text-primary">{totalPrice} ريال</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* نموذج معلومات الشحن */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات الشحن</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="customer_name">الاسم الكامل *</Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  placeholder="أدخل اسمك الكامل"
                  required
                  disabled={isProcessing}
                />
              </div>

              <div>
                <Label htmlFor="customer_email">البريد الإلكتروني *</Label>
                <Input
                  id="customer_email"
                  name="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  required
                  disabled={isProcessing}
                />
              </div>

              <div>
                <Label htmlFor="customer_phone">رقم الهاتف *</Label>
                <Input
                  id="customer_phone"
                  name="customer_phone"
                  type="tel"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  placeholder="05xxxxxxxx"
                  required
                  disabled={isProcessing}
                />
              </div>

              <div>
                <Label htmlFor="city">المدينة *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="الرياض، جدة، الدمام..."
                  required
                  disabled={isProcessing}
                />
              </div>

              <div>
                <Label htmlFor="shipping_address">العنوان التفصيلي *</Label>
                <Input
                  id="shipping_address"
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleInputChange}
                  placeholder="الحي، الشارع، رقم المبنى..."
                  required
                  disabled={isProcessing}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <CreditCard className="ml-2 h-5 w-5" />
                    الدفع الآن
                    <ArrowRight className="mr-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                سيتم تحويلك إلى صفحة الدفع الآمنة
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
