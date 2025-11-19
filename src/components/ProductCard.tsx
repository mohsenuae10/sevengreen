import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { OptimizedImage } from './OptimizedImage';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  id: string;
  name_ar: string;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  category?: string;
  slug?: string | null;
}

export const ProductCard = ({
  id,
  name_ar,
  price,
  image_url,
  stock_quantity,
  category,
  slug,
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Generate consistent random values based on product ID
  const seededRandom = (seed: string, index: number) => {
    let hash = 0;
    const str = seed + index;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash % 100) / 100;
  };

  // Determine if product has discount
  const hasDiscount = seededRandom(id, 1) > 0.7;
  const discountPercent = hasDiscount ? Math.floor(seededRandom(id, 2) * 30) + 10 : 0;
  const originalPrice = hasDiscount ? price / (1 - discountPercent / 100) : price;

  // Determine if product has badge
  const hasBadge = seededRandom(id, 3) > 0.75;
  const badges = ['جديد', 'الأكثر مبيعاً', 'عرض خاص'];
  const badgeText = badges[Math.floor(seededRandom(id, 4) * badges.length)];

  // Generate rating
  const rating = 4 + seededRandom(id, 5);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (stock_quantity <= 0) {
      toast.error('المنتج غير متوفر حالياً');
      return;
    }

    addToCart({
      id,
      name_ar,
      price,
      image_url,
    });

    toast.success('تمت الإضافة إلى السلة', {
      description: name_ar,
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (stock_quantity <= 0) {
      toast.error('المنتج غير متوفر حالياً');
      return;
    }

    addToCart({
      id,
      name_ar,
      price,
      image_url,
    });

    navigate('/checkout');
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة');
  };

  const productUrl = slug ? `/product/${slug}` : `/product/${id}`;

  return (
    <Link 
      to={productUrl}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="group relative h-full bg-card rounded-2xl border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/40 hover:-translate-y-2">
        {/* Image Container */}
        <div className="relative aspect-square bg-background overflow-hidden p-3">
          <OptimizedImage
            src={image_url || '/placeholder.svg'}
            alt={name_ar}
            className="w-full h-full transition-transform duration-500 group-hover:scale-105"
            aspectRatio="1/1"
            width={400}
            height={400}
            objectFit="contain"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
            <div className="flex flex-col gap-2">
              {hasBadge && (
                <Badge className="bg-primary text-primary-foreground shadow-lg backdrop-blur-sm">
                  <Zap className="w-3 h-3 ml-1" />
                  {badgeText}
                </Badge>
              )}
              {hasDiscount && (
                <Badge variant="destructive" className="shadow-lg backdrop-blur-sm">
                  خصم {discountPercent}%
                </Badge>
              )}
            </div>

            {/* Favorite Button */}
            <button
              onClick={toggleFavorite}
              className={cn(
                "p-2.5 rounded-full backdrop-blur-sm transition-all duration-300 shadow-lg",
                isFavorite 
                  ? "bg-primary text-primary-foreground scale-110" 
                  : "bg-background/90 text-foreground hover:bg-background hover:scale-110"
              )}
            >
              <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
            </button>
          </div>

          {/* Stock Overlay */}
          {stock_quantity <= 0 && (
            <div className="absolute inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center">
              <span className="bg-destructive text-destructive-foreground px-6 py-3 rounded-full text-base font-bold shadow-lg">
                غير متوفر
              </span>
            </div>
          )}

          {/* Hover Actions */}
          {stock_quantity > 0 && (
            <div className={cn(
              "absolute inset-x-0 bottom-0 p-4 space-y-2 transition-all duration-300 bg-gradient-to-t from-background/95 to-transparent backdrop-blur-sm",
              isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            )}>
              <Button
                onClick={handleBuyNow}
                className="w-full bg-primary hover:bg-primary/90 shadow-lg"
              >
                <Zap className="w-4 h-4 ml-2" />
                اشتر الآن
              </Button>
              <Button
                onClick={handleAddToCart}
                variant="outline"
                className="w-full bg-background/80 backdrop-blur-sm"
              >
                <ShoppingCart className="w-4 h-4 ml-2" />
                أضف للسلة
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Category */}
          {category && (
            <span className="text-xs text-muted-foreground font-medium">
              {category}
            </span>
          )}

          {/* Product Name */}
          <h3 className="font-bold text-base line-clamp-2 text-foreground leading-tight min-h-[2.5rem]">
            {name_ar}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-muted text-muted"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({rating.toFixed(1)})
            </span>
          </div>

          {/* Price Section */}
          <div className="flex items-end justify-between pt-2 border-t border-border/50">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">
                  {price.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">ريال</span>
              </div>
              {hasDiscount && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground line-through">
                    {originalPrice.toFixed(2)} ريال
                  </span>
                </div>
              )}
            </div>

            {stock_quantity > 0 && stock_quantity <= 5 && (
              <Badge variant="outline" className="text-orange-500 border-orange-500/30">
                {stock_quantity} متبقي
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};