import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/OptimizedImage';

interface ProductImage {
  id?: string;
  image_url: string;
  is_primary?: boolean;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export const ProductImageGallery = ({ images, productName }: ProductImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">لا توجد صور</p>
      </div>
    );
  }

  const currentImage = images[selectedIndex];

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* الصورة الرئيسية */}
      <div className="relative group">
        <OptimizedImage
          src={currentImage.image_url}
          alt={`${productName} - صورة عالية الجودة ${selectedIndex + 1} من ${images.length} - منتجات لمسة الجمال الطبيعية`}
          className="w-full rounded-lg"
          aspectRatio="1/1"
          width={800}
          height={800}
          priority={selectedIndex === 0}
          objectFit="contain"
        />
        
        {/* أزرار التنقل - تظهر فقط إذا كان هناك أكثر من صورة */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              aria-label="الصورة السابقة"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              aria-label="الصورة التالية"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* مؤشر عدد الصور */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* الصور المصغرة - تظهر فقط إذا كان هناك أكثر من صورة */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                selectedIndex === index
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50"
              )}
              aria-label={`عرض الصورة ${index + 1}`}
            >
              <OptimizedImage
                src={image.image_url}
                alt={`${productName} - صورة مصغرة ${index + 1} - منتج طبيعي من لمسة الجمال`}
                className="w-full h-full"
                aspectRatio="1/1"
                width={200}
                height={200}
                objectFit="contain"
              />
              {image.is_primary && (
                <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                  رئيسية
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
