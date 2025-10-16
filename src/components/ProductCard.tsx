import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ShoppingCart, Heart, Zap } from 'lucide-react';
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
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  // محاكاة خصم عشوائي للعرض (يمكن استبداله ببيانات حقيقية من قاعدة البيانات)
  const hasDiscount = Math.random() > 0.6;
  const discountPercentage = hasDiscount ? Math.floor(Math.random() * 30) + 10 : 0;
  const oldPrice = hasDiscount ? price / (1 - discountPercentage / 100) : price;
  
  // شارات عشوائية للعرض
  const badges = ['منتج تريد', 'الأكثر مبيعاً', 'توصية الأسبوع', 'جديد'];
  const hasBadge = Math.random() > 0.5;
  const randomBadge = badges[Math.floor(Math.random() * badges.length)];

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

  const handleBuyNow = (e: React.MouseEvent) => {
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
    navigate('/checkout');
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
        <Badge className="absolute top-1 right-1 z-10 bg-yellow-400 text-black font-bold text-[7px] px-1 py-0 hover:bg-yellow-400">
          {randomBadge}
        </Badge>
      )}

      {/* أيقونة المفضلة */}
      <button
        onClick={toggleFavorite}
        className="absolute top-1 left-1 z-10 w-5 h-5 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
      >
        <Heart
          className={`h-2.5 w-2.5 transition-colors ${
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
          <div className="aspect-square bg-secondary flex items-center justify-center text-muted-foreground text-[8px]">
            لا توجد صورة
          </div>
        )}
      </Link>
      
      <CardContent className="p-1.5 space-y-0.5">
        {/* التقييم */}
        <div className="flex justify-center">
          <ProductRating rating={4.5} reviewCount={Math.floor(Math.random() * 50) + 5} showCount={false} size="xs" />
        </div>

        {/* اسم المنتج */}
        <Link to={`/product/${id}`}>
          <h3 className="font-bold text-[9px] text-center hover:text-primary transition-colors line-clamp-2 min-h-[1.8rem] leading-tight">
            {name_ar}
          </h3>
        </Link>

        {/* السعر والخصم */}
        <div className="text-center space-y-0.5">
          <div className="flex items-center justify-center gap-1.5">
            <p className="text-sm font-bold text-red-600">
              ₪ {price.toFixed(0)}
            </p>
            {hasDiscount && (
              <p className="text-[9px] text-muted-foreground line-through">
                ₪ {oldPrice.toFixed(0)}
              </p>
            )}
          </div>
          {hasDiscount && (
            <div className="bg-red-50 rounded px-1 py-0 inline-block">
              <p className="text-[8px] text-red-600 font-semibold">
                - {discountPercentage}%
              </p>
            </div>
          )}
        </div>

        {stock_quantity <= 0 && (
          <p className="text-[8px] text-destructive text-center">غير متوفر</p>
        )}

        {/* أزرار الإجراءات */}
        <div className="grid grid-cols-2 gap-1">
          <Button
            onClick={handleAddToCart}
            variant="outline"
            className="text-[9px] h-6 rounded-full font-bold border-green-600 text-green-600 hover:bg-green-50"
            disabled={stock_quantity <= 0}
          >
            <ShoppingCart className="ml-1 h-2.5 w-2.5" />
            للسلة
          </Button>
          
          <Button
            onClick={handleBuyNow}
            className="bg-green-600 hover:bg-green-700 text-white text-[9px] h-6 rounded-full font-bold"
            disabled={stock_quantity <= 0}
          >
            <Zap className="ml-1 h-2.5 w-2.5" />
            اشتر الآن
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};