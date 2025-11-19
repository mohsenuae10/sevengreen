import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { OptimizedImage } from './OptimizedImage';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SimpleProductCardProps {
  id: string;
  name_ar: string;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  slug?: string | null;
}

export const SimpleProductCard = ({
  id,
  name_ar,
  price,
  image_url,
  stock_quantity,
  slug,
}: SimpleProductCardProps) => {
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
      <div className="group relative h-full bg-card rounded-xl border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-square bg-background overflow-hidden p-2">
          <OptimizedImage
            src={image_url || '/placeholder.svg'}
            alt={name_ar}
            className="w-full h-full transition-transform duration-500 group-hover:scale-105"
            aspectRatio="1/1"
            width={300}
            height={300}
            objectFit="contain"
          />
          
          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            className={cn(
              "absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all duration-300",
              isFavorite 
                ? "bg-primary text-primary-foreground" 
                : "bg-background/80 text-foreground hover:bg-background"
            )}
          >
            <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
          </button>

          {/* Stock Badge */}
          {stock_quantity <= 0 && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <span className="bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-sm font-bold">
                غير متوفر
              </span>
            </div>
          )}

          {/* Quick Add Button - Shows on Hover */}
          {stock_quantity > 0 && (
            <div className={cn(
              "absolute inset-x-0 bottom-0 p-3 transition-all duration-300",
              isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            )}>
              <Button
                onClick={handleAddToCart}
                className="w-full bg-primary/95 hover:bg-primary backdrop-blur-sm"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4 ml-2" />
                أضف للسلة
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 space-y-2">
          {/* Product Name */}
          <h3 className="font-semibold text-sm line-clamp-2 text-foreground leading-tight min-h-[2.5rem]">
            {name_ar}
          </h3>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-primary">
                {price.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">ريال</span>
            </div>
            
            {stock_quantity > 0 && stock_quantity <= 5 && (
              <span className="text-xs text-orange-500 font-medium">
                {stock_quantity} متبقي
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
