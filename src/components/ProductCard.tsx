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

  // دالة لتوليد رقم عشوائي ثابت بناءً على ID
  const seededRandom = (seed: string, max: number = 1) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    return (Math.abs(hash) % 100) / 100 * max;
  };

  // استخدام ID للحصول على قيم ثابتة
  const discountSeed = seededRandom(id);
  const hasDiscount = discountSeed > 0.6;
  const discountPercentage = hasDiscount ? Math.floor(discountSeed * 30) + 10 : 0;
  const oldPrice = hasDiscount ? price / (1 - discountPercentage / 100) : price;

  const badges = ['الأكثر مبيعاً', 'منتج جديد', 'عرض خاص', 'الأكثر شعبية'];
  const badgeSeed = seededRandom(id + 'badge');
  const hasBadge = badgeSeed > 0.5;
  const badgeIndex = Math.floor(seededRandom(id + 'badgeType', badges.length));
  const randomBadge = badges[badgeIndex];

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
    <Card className="overflow-hidden hover:shadow-luxury transition-all duration-500 group relative bg-gradient-card h-full flex flex-col border-2 border-primary/20 hover:border-primary/40 hover:-translate-y-2 animate-fade-in">
      {/* شارة المنتج */}
      {hasBadge && (
        <Badge className="absolute top-2 right-2 z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-[9px] px-2 py-0.5 shadow-md">
          {randomBadge}
        </Badge>
      )}

      {/* أيقونة المفضلة */}
      <button
        onClick={toggleFavorite}
        className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-sm"
        aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
      >
        <Heart
          className={`h-4 w-4 transition-all ${
            isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-600'
          }`}
        />
      </button>

      <Link to={`/product/${slug || id}`} className="relative overflow-hidden">
        {image_url ? (
          <OptimizedImage
            src={image_url}
            alt={`${name_ar} - منتج طبيعي 100% من لمسة الجمال${category ? ` | ${category}` : ''}`}
            className="aspect-square group-hover:scale-110 transition-transform duration-700 group-hover:brightness-105"
            aspectRatio="1/1"
          />
        ) : (
          <div className="aspect-square bg-secondary flex items-center justify-center text-muted-foreground text-[8px]">
            لا توجد صورة
          </div>
        )}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Link>
      
      <CardContent className="p-3 md:p-4 flex-1 flex flex-col justify-between gap-2">
        {/* اسم المنتج */}
        <Link to={`/product/${slug || id}`}>
          <h3 className="font-bold text-xs md:text-sm text-center text-primary hover:text-primary/80 transition-all duration-300 line-clamp-2 min-h-[2.5rem] leading-tight flex items-center justify-center px-1 group-hover:scale-105">
            {name_ar}
          </h3>
        </Link>

        {/* التقييم - محذوف لأنه كان يستخدم أرقام مزيفة */}

        {/* قسم السعر */}
        <div className="text-center space-y-1 py-2">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-baseline gap-1">
              <p className="text-lg md:text-xl font-bold text-primary">
                {price.toFixed(2)}
              </p>
              <p className="text-xs font-semibold text-muted-foreground">
                ر.س
              </p>
            </div>
            {hasDiscount && (
              <div className="flex items-baseline gap-0.5">
                <p className="text-xs text-muted-foreground line-through">
                  {oldPrice.toFixed(2)}
                </p>
              </div>
            )}
          </div>
          {hasDiscount && (
            <div className="inline-block">
              <Badge variant="destructive" className="text-[10px] px-2 py-0.5">
                وفّر {discountPercentage}%
              </Badge>
            </div>
          )}
        </div>

        {/* رسالة غير متوفر */}
        {stock_quantity <= 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md py-1.5 px-2">
            <p className="text-xs text-destructive text-center font-semibold">
              نفذت الكمية
            </p>
          </div>
        )}

        {/* أزرار الإجراءات */}
        <div className="flex gap-2 mt-auto pt-2">
          <Button
            onClick={handleAddToCart}
            variant="outline"
            size="sm"
            className="flex-1 h-9 rounded-lg text-xs hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 hover:shadow-md active:scale-95"
            disabled={stock_quantity <= 0}
          >
            <ShoppingCart className="h-4 w-4 group-hover:animate-pulse" />
          </Button>
          <Button
            onClick={handleBuyNow}
            size="sm"
            className="flex-[2] h-9 rounded-lg text-xs font-bold hover:scale-110 active:scale-95 transition-all duration-300 hover:shadow-lg"
            disabled={stock_quantity <= 0}
          >
            اشتر الآن
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};