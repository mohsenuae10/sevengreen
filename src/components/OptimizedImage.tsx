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
}

export const OptimizedImage = ({
  src,
  alt,
  className,
  aspectRatio = '1/1',
  priority = false,
  width,
  height,
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

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ aspectRatio }}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={hasError ? '/placeholder.svg' : src}
        alt={alt}
        width={calculatedWidth}
        height={calculatedHeight}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
      />
    </div>
  );
};
