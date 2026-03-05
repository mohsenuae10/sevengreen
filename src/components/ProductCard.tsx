import { useNavigate } from '@/hooks/useNextRouter';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ShoppingCart, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { OptimizedImage } from './OptimizedImage';
import ProductRating from './product/ProductRating';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguageCurrency } from '@/contexts/LanguageCurrencyContext';
import LocalizedLink from './LocalizedLink';

interface ProductCardProps {
  id: string;
  name_ar: string;
  name_en?: string;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  category?: string;
  category_ar?: string | null;
  category_en?: string | null;
  slug?: string | null;
  showCartButtonOnly?: boolean;
}

export const ProductCard = ({ id, name_ar, name_en, price, image_url, stock_quantity, category, category_ar, category_en, slug, showCartButtonOnly = false }: ProductCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const { t, language, formatPrice, formatPriceRaw, getLocalizedPath, getLocalizedField } = useLanguageCurrency();

  const productName = language === 'en' && name_en ? name_en : name_ar;
  const categoryName = language === 'en' && category_en ? category_en : (category_ar || '');

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (stock_quantity <= 0) {
      toast({
        title: t('common.unavailable'),
        description: t('common.unavailableDesc'),
        variant: 'destructive',
      });
      return;
    }

    addToCart({ id, name_ar, name_en, price, image_url });
    toast({
      title: t('common.added'),
      description: t('product.addedToCart', { name: productName }),
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (stock_quantity <= 0) {
      toast({
        title: t('common.unavailable'),
        description: t('common.unavailableDesc'),
        variant: 'destructive',
      });
      return;
    }

    addToCart({ id, name_ar, name_en, price, image_url });
    navigate(getLocalizedPath('/checkout'));
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? t('common.removed') : t('common.added'),
      description: isFavorite ? t('common.removedFromFavorites') : t('common.addedToFavorites'),
    });
  };

  const priceInfo = formatPriceRaw(price);
  const oldPriceFormatted = formatPrice(oldPrice);
  const savingsFormatted = formatPrice(oldPrice - price);

  return (
    <Card className="overflow-hidden transition-all duration-500 group relative bg-white h-full flex flex-col border border-gray-100 hover:border-primary/25 hover:shadow-card animate-fade-in rounded-2xl">
      {/* شارة الخصم */}
      {hasDiscount && (
        <div className="absolute top-3 end-3 z-20 bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-soft">
          {discountPercentage}% {t('common.discount')}
        </div>
      )}

      {/* أيقونة المفضلة */}
      <button
        onClick={toggleFavorite}
        className="absolute top-3 start-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-secondary transition-all duration-300 shadow-sm border border-gray-100/80 group/fav"
        aria-label={isFavorite ? t('common.removeFromFavorites') : t('common.addToFavorites')}
      >
        <Heart
          className={`h-3.5 w-3.5 transition-all duration-300 ${
            isFavorite ? 'fill-primary text-primary' : 'text-gray-400 group-hover/fav:text-primary'
          }`}
        />
      </button>

      {/* صورة المنتج */}
      <LocalizedLink to={`/product/${slug || id}`} className="relative overflow-hidden bg-secondary/30">
        <div className="relative">
          {image_url ? (
            <OptimizedImage
              src={image_url}
              alt={`${productName}${categoryName ? ` - ${categoryName}` : ''} - ${t('common.naturalProduct')}`}
              className="aspect-square group-hover:scale-105 transition-transform duration-500"
              aspectRatio="1/1"
              width={350}
              height={350}
            />
          ) : (
            <div className="aspect-square bg-secondary/50 flex items-center justify-center text-muted-foreground text-xs">
              {t('common.noImage')}
            </div>
          )}
        </div>

        {/* حالة نفاد المخزون */}
        {stock_quantity <= 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-bold px-4 py-1.5 rounded-full">
              {t('common.outOfStock')}
            </span>
          </div>
        )}
      </LocalizedLink>
      
      <CardContent className="p-3.5 flex-1 flex flex-col gap-2 relative">
        {/* اسم المنتج */}
        <LocalizedLink to={`/product/${slug || id}`} className="flex-1">
          <h3 className="font-bold text-[13px] text-center text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-relaxed min-h-[2.5rem] flex items-center justify-center">
            {productName}
          </h3>
        </LocalizedLink>

        {/* التقييم */}
        {ratingData && ratingData.review_count > 0 && (
          <div className="flex justify-center">
            <ProductRating 
              rating={Number(ratingData.average_rating) || 0} 
              reviewCount={ratingData.review_count}
              showCount={true}
              size="xs"
            />
          </div>
        )}

        {/* السعر */}
        <div className="text-center py-1.5">
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-xl font-black text-primary">
              {priceInfo.amount}
            </span>
            <span className="text-[11px] font-semibold text-primary/60">{priceInfo.symbol}</span>
          </div>
          {hasDiscount && (
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <span className="text-[11px] text-muted-foreground line-through">
                {oldPriceFormatted}
              </span>
              <span className="text-[10px] text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded">
                {t('common.save_amount')} {savingsFormatted}
              </span>
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex gap-1.5 mt-auto pt-1">
          {showCartButtonOnly ? (
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="w-full h-9 rounded-xl text-xs font-bold transition-all duration-300 bg-primary hover:bg-primary-dark shadow-sm hover:shadow-soft border-0"
              disabled={stock_quantity <= 0}
            >
              <ShoppingCart className="h-3.5 w-3.5 me-1.5" />
              {t('product.addToCart')}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleAddToCart}
                variant="outline"
                size="sm"
                className="h-9 w-9 min-w-[36px] rounded-xl border border-primary/30 bg-white hover:bg-primary/5 text-primary transition-all duration-300 p-0 flex items-center justify-center"
                disabled={stock_quantity <= 0}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
              </Button>
              <Button
                onClick={handleBuyNow}
                size="sm"
                className="flex-1 h-9 rounded-xl text-xs font-bold transition-all duration-300 bg-primary hover:bg-primary-dark shadow-sm hover:shadow-soft border-0"
                disabled={stock_quantity <= 0}
              >
                <ShoppingBag className="h-3.5 w-3.5 me-1.5" />
                {t('product.buyNow')}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};