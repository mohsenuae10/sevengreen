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
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProductCardProps {
  id: string;
  name_ar: string;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  category?: string;
  category_ar?: string | null;
  slug?: string | null;
  showCartButtonOnly?: boolean;
}

export const ProductCard = ({ id, name_ar, price, image_url, stock_quantity, category, category_ar, slug, showCartButtonOnly = false }: ProductCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  // جلب التقييمات من قاعدة البيانات
  const { data: ratingData } = useQuery({
    queryKey: ['product-rating', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_product_rating', { product_uuid: id });
      
      if (error) throw error;
      return data?.[0] || null;
    },
  });

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
    <Card className="overflow-hidden hover:shadow-luxury transition-all duration-500 group relative bg-white h-full flex flex-col border border-border/50 hover:border-primary/60 hover:-translate-y-3 animate-fade-in rounded-2xl">
      {/* شارة المنتج */}
      {hasBadge && (
        <Badge className="absolute top-3 right-3 z-10 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 text-gray-900 font-bold text-[10px] px-3 py-1 shadow-lg rounded-full">
          {randomBadge}
        </Badge>
      )}

      {/* أيقونة المفضلة */}
      <button
        onClick={toggleFavorite}
        className="absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white hover:scale-110 transition-all shadow-lg border border-gray-100"
        aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
      >
        <Heart
          className={`h-4 w-4 transition-all duration-300 ${
            isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-400 hover:text-red-400'
          }`}
        />
      </button>

      <Link to={`/product/${slug || id}`} className="relative overflow-hidden group/image rounded-t-2xl">
        {image_url ? (
          <OptimizedImage
            src={image_url}
            alt={`${name_ar}${category_ar ? ` - ${category_ar}` : ''} - منتج طبيعي من لمسة بيوتي`}
            className="aspect-square group-hover:scale-105 transition-transform duration-700 group-hover:brightness-105"
            aspectRatio="1/1"
            width={400}
            height={400}
          />
        ) : (
          <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-muted-foreground text-[8px]">
            لا توجد صورة
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Link>
      
      <CardContent className="p-4 md:p-5 flex-1 flex flex-col justify-between gap-3 bg-gradient-to-b from-transparent to-gray-50/30">
        {/* اسم المنتج */}
        <Link to={`/product/${slug || id}`}>
          <h3 className="font-bold text-sm md:text-base text-center text-foreground hover:text-primary transition-all duration-300 line-clamp-2 min-h-[2.5rem] leading-relaxed flex items-center justify-center px-2 group-hover:scale-[1.02]">
            {name_ar}
          </h3>
        </Link>

        {/* التقييم */}
        {ratingData && ratingData.review_count > 0 && (
          <div className="flex justify-center py-1">
            <ProductRating 
              rating={Number(ratingData.average_rating) || 0} 
              reviewCount={ratingData.review_count}
              showCount={true}
              size="xs"
            />
          </div>
        )}

        {/* قسم السعر */}
        <div className="text-center space-y-1.5 py-2">
          <div className="flex items-center justify-center gap-2.5">
            <div className="flex items-baseline gap-1.5 bg-gradient-to-br from-primary/10 to-primary/5 px-4 py-2 rounded-xl">
              <p className="text-xl md:text-2xl font-extrabold text-primary">
                {price.toFixed(2)}
              </p>
              <p className="text-sm font-semibold text-primary/80">
                ر.س
              </p>
            </div>
            {hasDiscount && (
              <div className="flex items-baseline gap-1">
                <p className="text-sm text-gray-400 line-through decoration-2">
                  {oldPrice.toFixed(2)}
                </p>
              </div>
            )}
          </div>
          {hasDiscount && (
            <div className="inline-block">
              <Badge variant="destructive" className="text-[11px] px-3 py-1 rounded-full font-bold shadow-sm">
                خصم {discountPercentage}%
              </Badge>
            </div>
          )}
        </div>

        {/* رسالة غير متوفر */}
        {stock_quantity <= 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl py-2 px-3 shadow-sm">
            <p className="text-xs text-red-600 text-center font-bold">
              نفذت الكمية
            </p>
          </div>
        )}

        {/* أزرار الإجراءات */}
        <div className="flex gap-2 mt-auto pt-3">
          {showCartButtonOnly ? (
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="w-full h-10 rounded-xl text-sm font-bold hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-xl bg-gradient-to-r from-primary to-primary-dark"
              disabled={stock_quantity <= 0}
            >
              <ShoppingCart className="h-4 w-4 ml-2" />
              أضف للسلة
            </Button>
          ) : (
            <>
              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="sm"
                className="flex-1 h-10 rounded-xl text-sm hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 border-2 border-primary/30 hover:border-primary"
                disabled={stock_quantity <= 0}
              >
                <ShoppingCart className="h-4 w-4 group-hover:animate-bounce" />
              </Button>
              <Button
                onClick={handleBuyNow}
                size="sm"
                className="flex-[2] h-10 rounded-xl text-sm font-bold hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-xl bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
                disabled={stock_quantity <= 0}
              >
                <Zap className="h-4 w-4 ml-1.5" />
                اشتر الآن
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};