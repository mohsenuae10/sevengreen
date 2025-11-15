import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { OptimizedImage } from '@/components/OptimizedImage';

export default function Cart() {
  const { items, updateQuantity, removeFromCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <>
        <SEOHead
          title="سلة التسوق"
          description="سلة التسوق الخاصة بك في لمسة الجمال للمنتجات الطبيعية"
        />
        <BreadcrumbSchema
          items={[
            { name: 'الرئيسية', url: '/' },
            { name: 'سلة التسوق', url: '/cart' },
          ]}
        />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold">السلة فارغة</h2>
            <p className="text-muted-foreground">
              ابدأ بإضافة منتجات إلى سلة التسوق
            </p>
            <Button asChild size="lg">
              <Link to="/products">تصفح المنتجات</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="سلة التسوق"
        description="سلة التسوق الخاصة بك في لمسة الجمال للمنتجات الطبيعية"
      />
      <BreadcrumbSchema
        items={[
          { name: 'الرئيسية', url: '/' },
          { name: 'سلة التسوق', url: '/cart' },
        ]}
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">سلة التسوق</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {item.image_url ? (
                    <OptimizedImage
                      src={item.image_url}
                      alt={`${item.name_ar} - منتج طبيعي من لمسة الجمال`}
                      className="w-24 h-24 flex-shrink-0"
                      aspectRatio="1/1"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-secondary flex-shrink-0 flex items-center justify-center text-muted-foreground">
                      صورة
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2">{item.name_ar}</h3>
                    <p className="text-primary font-bold mb-3">
                      {item.price.toFixed(2)} ريال
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-left font-bold">
                    {(item.price * item.quantity).toFixed(2)} ريال
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold">ملخص الطلب</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span className="font-medium">{totalPrice.toFixed(2)} ريال</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">رسوم الشحن</span>
                  <span className="font-medium">يتم حسابها لاحقاً</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span className="text-primary">{totalPrice.toFixed(2)} ريال</span>
                </div>
              </div>

              <Button asChild size="lg" className="w-full">
                <Link to="/checkout">إتمام الطلب</Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/products">متابعة التسوق</Link>
              </Button>

              {/* شعارات طرق الدفع */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-muted-foreground mb-3 text-center font-medium">طرق الدفع المقبولة</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {[
                    { name: 'Visa', file: 'visa.svg' },
                    { name: 'Mastercard', file: 'mastercard.svg' },
                    { name: 'Apple Pay', file: 'apple-pay.svg' },
                    { name: 'Google Pay', file: 'google-pay.svg' },
                    { name: 'American Express', file: 'american-express.svg' },
                  ].map((payment) => (
                    <div key={payment.name} className="bg-background dark:bg-muted/30 p-2 rounded-lg border border-border/50 h-10 flex items-center justify-center min-w-[60px]">
                      <img
                        src={`/images/payment-icons/${payment.file}`}
                        alt={payment.name}
                        className="h-6 w-auto object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}
