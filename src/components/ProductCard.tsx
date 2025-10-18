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
  slug?: string | null;
}

export const ProductCard = ({ id, name_ar, price, image_url, stock_quantity, category, slug }: ProductCardProps) => {
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
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 group relative bg-gradient-to-br from-card to-secondary/30 h-full flex flex-col border-2 border-transparent hover:border-primary/20 rounded-2xl">
      {/* Decorative corner gradient */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* شارة المنتج */}
      {hasBadge && (
        <Badge className="absolute top-2 right-2 z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-[8px] px-2 py-0.5 hover:bg-yellow-400 shadow-lg rounded-full">
          {randomBadge}
        </Badge>
      )}

      {/* أيقونة المفضلة */}
      <button
        onClick={toggleFavorite}
        className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-300 shadow-md"
      >
        <Heart
          className={`h-3.5 w-3.5 transition-all duration-300 ${
            isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-600'
          }`}
        />
      </button>

      <Link to={`/product/${slug || id}`} className="relative">
        {/* Image container with overlay */}
        <div className="relative overflow-hidden rounded-t-2xl">
          {image_url ? (
            <>
              <OptimizedImage
                src={image_url}
                alt={`${name_ar} - منتج طبيعي 100% من سفن جرين${category ? ` | ${category}` : ''}`}
                className="aspect-square group-hover:scale-110 transition-transform duration-700"
                aspectRatio="1/1"
              />
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </>
          ) : (
            <div className="aspect-square bg-gradient-to-br from-secondary to-muted flex items-center justify-center text-muted-foreground text-[8px]">
              لا توجد صورة
            </div>
          )}
        </div>
      </Link>
      
      <CardContent className="p-3 flex flex-col flex-grow space-y-2">
        {/* اسم المنتج */}
        <Link to={`/product/${slug || id}`}>
          <h3 className="font-bold text-[11px] text-center hover:text-primary transition-colors line-clamp-2 h-9 leading-snug flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            {name_ar}
          </h3>
        </Link>

        {/* التقييم */}
        <div className="flex justify-center">
          <ProductRating 
            rating={Number((Math.random() * 1 + 4).toFixed(1))} 
            reviewCount={Math.floor(Math.random() * 150) + 10} 
            showCount={false} 
            size="sm" 
          />
        </div>

        {/* السعر والخصم */}
        <div className="text-center space-y-1 min-h-[3.5rem]">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-baseline gap-1 bg-primary/5 px-2 py-1 rounded-lg">
              <p className="text-base font-bold text-primary">
                {price.toFixed(2)}
              </p>
              <p className="text-[9px] font-semibold text-muted-foreground">
                ر.س
              </p>
            </div>
            {hasDiscount && (
              <div className="flex items-baseline gap-0.5">
                <p className="text-[10px] text-muted-foreground line-through">
                  {oldPrice.toFixed(2)}
                </p>
                <p className="text-[8px] text-muted-foreground">ر.س</p>
              </div>
            )}
          </div>
          {/* مساحة محجوزة للخصم */}
          <div className="h-5">
            {hasDiscount && (
              <div className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-full px-2 py-0.5 inline-block shadow-sm">
                <p className="text-[9px] text-white font-bold">
                  وفّر {discountPercentage}%
                </p>
              </div>
            )}
          </div>
        </div>

        {stock_quantity <= 0 && (
          <p className="text-[9px] text-destructive text-center font-semibold bg-destructive/10 rounded-lg py-1 border border-destructive/20">
            غير متوفر
          </p>
        )}

        {/* أزرار الشراء */}
        <div className="flex gap-1.5 mt-auto">
          <Button
            onClick={handleAddToCart}
            variant="outline"
            size="sm"
            className="flex-1 h-7 rounded-lg text-[10px] p-0 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300"
            disabled={stock_quantity <= 0}
          >
            <ShoppingCart className="h-3 w-3" />
          </Button>
          <Button
            onClick={handleBuyNow}
            size="sm"
            className="flex-[2] h-7 rounded-lg text-[10px] font-bold p-1 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary shadow-md hover:shadow-lg transition-all duration-300"
            disabled={stock_quantity <= 0}
          >
            <Zap className="h-3 w-3 ml-1" />
            اشتر الآن
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};