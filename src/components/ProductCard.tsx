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
    <Card className="overflow-hidden transition-all duration-700 group relative bg-gradient-to-br from-white via-gray-50/30 to-white h-full flex flex-col border-2 border-transparent hover:border-primary/30 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] animate-fade-in rounded-2xl backdrop-blur-sm">
      {/* Overlay Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl" />
      
      {/* شارة الخصم الدائرية */}
      {hasDiscount && (
        <div className="absolute top-3 right-3 z-20 w-14 h-14 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex flex-col items-center justify-center shadow-2xl shadow-red-500/50 border-2 border-white transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
          <span className="text-white font-black text-[11px] leading-none">-{discountPercentage}%</span>
          <span className="text-white/90 font-bold text-[7px] leading-none">خصم</span>
        </div>
      )}

      {/* شارة المنتج */}
      {hasBadge && !hasDiscount && (
        <Badge className="absolute top-3 right-3 z-20 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-[9px] px-2.5 py-1 shadow-xl shadow-emerald-500/30 border border-white/20 rounded-lg">
          ✨ {randomBadge}
        </Badge>
      )}

      {/* أيقونة المفضلة */}
      <button
        onClick={toggleFavorite}
        className="absolute top-3 left-3 z-20 w-9 h-9 rounded-xl bg-white/95 backdrop-blur-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-100 group/fav"
        aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
      >
        <Heart
          className={`h-4 w-4 transition-all duration-300 ${
            isFavorite ? 'fill-red-500 text-red-500 animate-pulse' : 'text-gray-300 group-hover/fav:text-red-400 group-hover/fav:scale-110'
          }`}
        />
      </button>

      {/* صورة المنتج */}
      <Link to={`/product/${slug || id}`} className="relative overflow-hidden group/image bg-gradient-to-br from-gray-50 to-white p-2">
        <div className="rounded-xl overflow-hidden shadow-inner relative">
          {image_url ? (
            <OptimizedImage
              src={image_url}
              alt={`${name_ar}${category_ar ? ` - ${category_ar}` : ''} - منتج طبيعي من لمسة بيوتي`}
              className="aspect-square group-hover:scale-110 group-hover:rotate-2 transition-all duration-700 group-hover:brightness-110"
              aspectRatio="1/1"
              width={350}
              height={350}
            />
          ) : (
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-muted-foreground text-[8px]">
              لا توجد صورة
            </div>
          )}
          {/* تأثير لامع عند التمرير */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        </div>
        {/* إطار داخلي متوهج */}
        <div className="absolute inset-2 rounded-xl border-2 border-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </Link>
      
      <CardContent className="p-4 flex-1 flex flex-col gap-2.5 relative z-10">
        {/* اسم المنتج مع خلفية */}
        <Link to={`/product/${slug || id}`}>
          <div className="bg-gradient-to-r from-gray-50/80 via-white/80 to-gray-50/80 backdrop-blur-sm rounded-lg p-2.5 border border-gray-100/50 group-hover:border-primary/20 transition-all duration-300 min-h-[3rem] flex items-center justify-center">
            <h3 className="font-extrabold text-sm text-center text-gray-800 group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-snug">
              {name_ar}
            </h3>
          </div>
        </Link>

        {/* التقييم مع خلفية */}
        {ratingData && ratingData.review_count > 0 && (
          <div className="flex justify-center">
            <div className="bg-amber-50/80 backdrop-blur-sm px-3 py-1 rounded-full border border-amber-100">
              <ProductRating 
                rating={Number(ratingData.average_rating) || 0} 
                reviewCount={ratingData.review_count}
                showCount={true}
                size="xs"
              />
            </div>
          </div>
        )}

        {/* قسم السعر مع تصميم جديد */}
        <div className="relative">
          <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 backdrop-blur-sm rounded-xl p-3 border-2 border-primary/20 shadow-lg shadow-primary/5 group-hover:shadow-xl group-hover:shadow-primary/10 transition-all duration-300">
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-primary bg-gradient-to-br from-primary to-primary-dark bg-clip-text text-transparent">
                  {price.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-primary/70">ر.س</span>
              </div>
            </div>
            {hasDiscount && (
              <div className="flex items-center justify-center gap-2 mt-1 pt-1 border-t border-primary/10">
                <span className="text-xs text-gray-400 line-through font-medium">
                  {oldPrice.toFixed(2)} ر.س
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  وفّر {(oldPrice - price).toFixed(2)} ر.س
                </span>
              </div>
            )}
          </div>
        </div>

        {/* رسالة غير متوفر */}
        {stock_quantity <= 0 && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-lg py-2 px-3 shadow-sm">
            <p className="text-xs text-red-600 text-center font-extrabold flex items-center justify-center gap-1">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              نفذت الكمية
            </p>
          </div>
        )}

        {/* أزرار الإجراءات بتصميم جديد */}
        <div className="flex gap-2 mt-auto">
          {showCartButtonOnly ? (
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="w-full h-11 rounded-xl text-sm font-bold hover:scale-[1.02] active:scale-95 transition-all duration-300 bg-gradient-to-r from-primary via-primary-dark to-primary hover:shadow-2xl hover:shadow-primary/40 border-0 relative overflow-hidden group/btn"
              disabled={stock_quantity <= 0}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></span>
              <ShoppingCart className="h-4 w-4 ml-2" />
              أضف للسلة
            </Button>
          ) : (
            <>
              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="sm"
                className="flex-1 h-11 rounded-xl border-2 border-primary/40 hover:border-primary bg-white hover:bg-primary text-primary hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20 active:scale-95 group/cart font-bold relative overflow-hidden"
                disabled={stock_quantity <= 0}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 -translate-x-full group-hover/cart:translate-x-full transition-transform duration-500"></span>
                <ShoppingCart className="h-4 w-4 group-hover/cart:animate-bounce relative z-10" />
              </Button>
              <Button
                onClick={handleBuyNow}
                size="sm"
                className="flex-[2.5] h-11 rounded-xl text-sm font-extrabold hover:scale-[1.02] active:scale-95 transition-all duration-300 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/50 border-0 relative overflow-hidden group/buy"
                disabled={stock_quantity <= 0}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 -translate-x-full group-hover/buy:translate-x-full transition-transform duration-700"></span>
                <Zap className="h-4 w-4 ml-1.5 group-hover/buy:animate-pulse relative z-10" />
                <span className="relative z-10">اشتر الآن</span>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};