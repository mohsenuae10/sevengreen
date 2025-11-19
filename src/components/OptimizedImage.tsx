import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export const OptimizedImage = ({
  src,
  alt,
  className,
  aspectRatio = '1/1',
  priority = false,
  width,
  height,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  objectFit = 'cover',
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Calculate dimensions if not provided
  const calculatedWidth = width || 800;
  const calculatedHeight = height || (aspectRatio ? calculatedWidth / parseFloat(aspectRatio.replace('/', ' / ')) : calculatedWidth);

  // Generate srcset for responsive images (if image is from Supabase Storage)
  const generateSrcSet = (imageSrc: string): string => {
    if (!imageSrc.includes('supabase.co/storage')) {
      return '';
    }

    // Generate multiple sizes: 400w, 800w, 1200w, 1600w
    const widths = [400, 800, 1200, 1600];
    const srcset = widths
      .map(w => {
        // Add width parameter to Supabase Storage URL
        const url = new URL(imageSrc);
        url.searchParams.set('width', w.toString());
        url.searchParams.set('quality', '85');
        return `${url.toString()} ${w}w`;
      })
      .join(', ');

    return srcset;
  };

  const srcset = generateSrcSet(src);

  return (
    <div 
      className={cn('relative overflow-hidden bg-muted/10', className)} 
      style={{ aspectRatio }}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted/20 via-muted/10 to-muted/20 animate-pulse" />
      )}
      <picture>
        {/* WebP format for modern browsers */}
        {src.includes('supabase.co/storage') && (
          <source
            type="image/webp"
            srcSet={srcset || src}
            sizes={sizes}
          />
        )}
        
        {/* Fallback to original format */}
        <img
          src={hasError ? '/placeholder.svg' : src}
          srcSet={srcset || undefined}
          sizes={srcset ? sizes : undefined}
          alt={alt}
          width={calculatedWidth}
          height={calculatedHeight}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          style={{ aspectRatio }}
          className={cn(
            'w-full h-full transition-opacity duration-300',
            `object-${objectFit}`,
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
        />
      </picture>
    </div>
  );
};
