import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { OptimizedImage } from './OptimizedImage';
import { Badge } from './ui/badge';
import ProductRating from './product/ProductRating';
import { useState } from 'react';

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
  const [isFavorite, setIsFavorite] = useState(false);

  // محاكاة خصم عشوائي للعرض (يمكن استبداله ببيانات حقيقية من قاعدة البيانات)
  const hasDiscount = Math.random() > 0.6;
  const discountPercentage = hasDiscount ? Math.floor(Math.random() * 30) + 10 : 0;
  const oldPrice = hasDiscount ? price / (1 - discountPercentage / 100) : price;
  
  // شارات عشوائية للعرض
  const badges = ['منتج تريد', 'الأكثر مبيعاً', 'توصية الأسبوع', 'جديد'];
  const hasBadge = Math.random() > 0.5;
  const randomBadge = badges[Math.floor(Math.random() * badges.length)];

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

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? 'تمت الإزالة' : 'تمت الإضافة',
      description: isFavorite ? 'تم إزالة المنتج من المفضلة' : 'تم إضافة المنتج للمفضلة',
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group relative bg-card">
      {/* شارة المنتج */}
      {hasBadge && (
        <Badge className="absolute top-2 right-2 z-10 bg-yellow-400 text-black font-bold text-[10px] hover:bg-yellow-400">
          {randomBadge}
        </Badge>
      )}

      {/* أيقونة المفضلة */}
      <button
        onClick={toggleFavorite}
        className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
      >
        <Heart
          className={`h-4 w-4 transition-colors ${
            isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
          }`}
        />
      </button>

      <Link to={`/product/${id}`}>
        {image_url ? (
          <OptimizedImage
            src={image_url}
            alt={`${name_ar} - منتج طبيعي 100% من سفن جرين${category ? ` | ${category}` : ''}`}
            className="aspect-square group-hover:scale-105 transition-transform duration-500"
            aspectRatio="1/1"
          />
        ) : (
          <div className="aspect-square bg-secondary flex items-center justify-center text-muted-foreground text-xs">
            لا توجد صورة
          </div>
        )}
      </Link>
      
      <CardContent className="p-3 space-y-2">
        {/* التقييم */}
        <div className="flex justify-center">
          <ProductRating rating={4.5} reviewCount={Math.floor(Math.random() * 50) + 5} showCount={false} />
        </div>

        {/* اسم المنتج */}
        <Link to={`/product/${id}`}>
          <h3 className="font-bold text-sm text-center hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
            {name_ar}
          </h3>
        </Link>

        {/* السعر والخصم */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <p className="text-xl font-bold text-red-600">
              ₪ {price.toFixed(0)}
            </p>
            {hasDiscount && (
              <p className="text-sm text-muted-foreground line-through">
                ₪ {oldPrice.toFixed(0)}
              </p>
            )}
          </div>
          {hasDiscount && (
            <p className="text-xs text-red-600 font-semibold">
              - {discountPercentage}%
            </p>
          )}
        </div>

        {stock_quantity <= 0 && (
          <p className="text-xs text-destructive text-center">غير متوفر</p>
        )}

        {/* زر الإضافة للسلة */}
        <Button
          onClick={handleAddToCart}
          className="w-full bg-green-600 hover:bg-green-700 text-white text-xs h-9 rounded-lg"
          disabled={stock_quantity <= 0}
        >
          <ShoppingCart className="ml-1 h-3.5 w-3.5" />
          إضافة للسلة
        </Button>
      </CardContent>
    </Card>
  );
};