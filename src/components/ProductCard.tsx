import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter } from './ui/card';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { OptimizedImage } from './OptimizedImage';

interface ProductCardProps {
  id: string;
  name_ar: string;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  category?: string;
}

export const ProductCard = ({ id, name_ar, price, image_url, stock_quantity, category }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
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
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/product/${id}`}>
        {image_url ? (
          <OptimizedImage
            src={image_url}
            alt={`${name_ar} - منتج طبيعي 100% من سفن جرين${category ? ` | ${category}` : ''}`}
            className="aspect-square"
            aspectRatio="1/1"
          />
        ) : (
          <div className="aspect-square bg-secondary flex items-center justify-center text-muted-foreground text-[10px]">
            لا توجد صورة
          </div>
        )}
      </Link>
      
      <CardContent className="p-2">
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold text-xs mb-1 hover:text-primary transition-colors line-clamp-2 leading-tight">
            {name_ar}
          </h3>
        </Link>
        <p className="text-sm font-bold text-primary">
          {price.toFixed(2)} ريال
        </p>
        {stock_quantity <= 0 && (
          <p className="text-[10px] text-destructive mt-0.5">غير متوفر</p>
        )}
      </CardContent>

      <CardFooter className="p-2 pt-0">
        <Button
          onClick={handleAddToCart}
          className="w-full text-[10px] h-7 px-2"
          disabled={stock_quantity <= 0}
        >
          <ShoppingCart className="ml-1 h-3 w-3" />
          أضف للسلة
        </Button>
      </CardFooter>
    </Card>
  );
};
