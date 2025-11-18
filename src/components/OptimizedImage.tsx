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
  const [blurDataUrl, setBlurDataUrl] = useState<string>('');

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

  // Generate srcset for responsive images with WebP support
  const generateSrcSet = (imageSrc: string): string => {
    if (!imageSrc.includes('supabase.co/storage')) {
      return '';
    }

    // Generate multiple sizes: 400w, 800w, 1200w, 1600w
    const widths = [400, 800, 1200, 1600];
    const srcset = widths
      .map(w => {
        // Add transformation parameters to Supabase Storage URL
        const url = new URL(imageSrc);
        url.searchParams.set('width', w.toString());
        url.searchParams.set('quality', '80');
        url.searchParams.set('format', 'webp');
        return `${url.toString()} ${w}w`;
      })
      .join(', ');

    return srcset;
  };

  // Generate tiny blur placeholder (32px width)
  const generateBlurPlaceholder = (imageSrc: string): string => {
    if (!imageSrc.includes('supabase.co/storage')) {
      return '';
    }

    const url = new URL(imageSrc);
    url.searchParams.set('width', '32');
    url.searchParams.set('quality', '20');
    url.searchParams.set('format', 'webp');
    return url.toString();
  };

  const srcset = generateSrcSet(src);
  const placeholderUrl = generateBlurPlaceholder(src);

  return (
    <div 
      className={cn('relative overflow-hidden bg-muted/10', className)} 
      style={{ aspectRatio }}
    >
      {/* Blur placeholder that shows while loading */}
      {isLoading && placeholderUrl && (
        <img
          src={placeholderUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 animate-pulse"
        />
      )}
      
      {/* Loading skeleton for non-Supabase images */}
      {isLoading && !placeholderUrl && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted/20 via-muted/10 to-muted/20 animate-pulse" />
      )}
      
      <picture>
        {/* WebP format for modern browsers with responsive sizes */}
        {src.includes('supabase.co/storage') && srcset && (
          <source
            type="image/webp"
            srcSet={srcset}
            sizes={sizes}
          />
        )}
        
        {/* Main image with optimized loading */}
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
            'w-full h-full transition-opacity duration-500 ease-out',
            `object-${objectFit}`,
            isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          )}
        />
      </picture>
    </div>
  );
};
