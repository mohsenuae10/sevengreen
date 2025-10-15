import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.stock_quantity <= 0) {
      toast({
        title: 'غير متوفر',
        description: 'هذا المنتج غير متوفر حالياً',
        variant: 'destructive',
      });
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name_ar: product.name_ar,
        price: product.price,
        image_url: product.image_url,
      });
    }

    toast({
      title: 'تمت الإضافة',
      description: `تم إضافة ${quantity}x ${product.name_ar} إلى السلة`,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">المنتج غير موجود</h2>
          <Button onClick={() => navigate('/products')}>
            العودة للمنتجات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowRight className="ml-2 h-4 w-4" />
        رجوع
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square rounded-lg overflow-hidden bg-secondary">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name_ar}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              لا توجد صورة
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
              {product.name_ar}
            </h1>
            <p className="text-sm text-muted-foreground">{product.category}</p>
          </div>

          <div className="text-3xl font-bold text-primary">
            {product.price.toFixed(2)} ريال
          </div>

          {product.description_ar && (
            <div>
              <h2 className="text-xl font-bold mb-2">الوصف</h2>
              <p className="text-muted-foreground leading-relaxed">
                {product.description_ar}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">الكمية</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock_quantity <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="font-medium w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={product.stock_quantity <= 0}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {product.stock_quantity > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    متوفر: {product.stock_quantity}
                  </p>
                ) : (
                  <p className="text-sm text-destructive font-medium">
                    غير متوفر
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              size="lg"
              className="w-full"
              disabled={product.stock_quantity <= 0}
            >
              <ShoppingCart className="ml-2 h-5 w-5" />
              أضف إلى السلة
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
