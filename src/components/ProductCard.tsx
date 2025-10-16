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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/product/${id}`}>
        {image_url ? (
          <OptimizedImage
            src={image_url}
            alt={`${name_ar} - منتج طبيعي 100% من سفن جرين${category ? ` | ${category}` : ''}`}
            className="aspect-square"
            aspectRatio="1/1"
          />
        ) : (
          <div className="aspect-square bg-secondary flex items-center justify-center text-muted-foreground">
            لا توجد صورة
          </div>
        )}
      </Link>
      
      <CardContent className="p-4">
        <Link to={`/product/${id}`}>
          <h3 className="font-bold text-lg mb-2 hover:text-primary transition-colors">
            {name_ar}
          </h3>
        </Link>
        <p className="text-2xl font-bold text-primary">
          {price.toFixed(2)} ريال
        </p>
        {stock_quantity <= 0 && (
          <p className="text-sm text-destructive mt-1">غير متوفر</p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          className="w-full"
          disabled={stock_quantity <= 0}
        >
          <ShoppingCart className="ml-2 h-4 w-4" />
          أضف للسلة
        </Button>
      </CardFooter>
    </Card>
  );
};
