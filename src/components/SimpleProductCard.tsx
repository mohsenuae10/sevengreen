import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { OptimizedImage } from './OptimizedImage';

interface SimpleProductCardProps {
  id: string;
  name_ar: string;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  slug?: string | null;
}

export const SimpleProductCard = ({ 
  id, 
  name_ar, 
  price, 
  image_url, 
  stock_quantity, 
  slug 
}: SimpleProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (stock_quantity <= 0) {
      toast({
        title: 'غير متوفر',
        description: 'هذا المنتج غير متوفر حالياً',
        variant: 'destructive',
      });
      return;
    }

    addToCart({ id, name_ar, price, image_url });
    toast({
      title: 'تمت الإضافة',
      description: `تم إضافة ${name_ar} إلى السلة`,
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group relative bg-gradient-card aspect-square flex flex-col border border-border hover:border-primary/40" style={{ contentVisibility: 'auto', contain: 'layout' }}>
      <Link to={`/product/${slug || id}`} className="relative overflow-hidden">
        {image_url ? (
          <OptimizedImage
            src={image_url}
            alt={`${name_ar} - منتج طبيعي من لمسة الجمال`}
            className="aspect-square group-hover:scale-105 transition-transform duration-500"
            aspectRatio="1/1"
            width={300}
            height={300}
            objectFit="contain"
          />
        ) : (
          <div className="aspect-square bg-muted flex items-center justify-center text-muted-foreground text-xs">
            لا توجد صورة
          </div>
        )}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
      
      <CardContent className="p-2 flex-1 flex flex-col justify-between gap-2">
        {/* اسم المنتج */}
        <Link to={`/product/${slug || id}`}>
          <h3 className="font-semibold text-xs text-center text-foreground hover:text-primary transition-colors line-clamp-2 min-h-[2rem] leading-tight">
            {name_ar}
          </h3>
        </Link>

        {/* السعر */}
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-1">
            <p className="text-base font-bold text-primary">
              {price.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              ر.س
            </p>
          </div>
        </div>

        {/* زر الإضافة للسلة */}
        <Button
          onClick={handleAddToCart}
          size="sm"
          className="w-full h-8 text-xs hover:scale-105 active:scale-95 transition-all"
          disabled={stock_quantity <= 0}
        >
          <ShoppingCart className="h-3.5 w-3.5 ml-1" />
          {stock_quantity <= 0 ? 'نفذت الكمية' : 'أضف للسلة'}
        </Button>
      </CardContent>
    </Card>
  );
};
