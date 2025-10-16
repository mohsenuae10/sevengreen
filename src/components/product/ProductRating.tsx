import { Star } from 'lucide-react';

interface ProductRatingProps {
  rating: number;
  reviewCount?: number;
  showCount?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export default function ProductRating({ 
  rating, 
  reviewCount = 0, 
  showCount = true,
  size = 'md' 
}: ProductRatingProps) {
  const sizeClasses = {
    xs: 'h-2.5 w-2.5',
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-accent text-accent'
                : 'fill-muted text-muted'
            }`}
          />
        ))}
      </div>
      {showCount && reviewCount > 0 && (
        <span className="text-sm text-muted-foreground">
          ({reviewCount} تقييم)
        </span>
      )}
    </div>
  );
}
