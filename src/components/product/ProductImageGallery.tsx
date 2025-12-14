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
      <div className="relative group rounded-2xl overflow-hidden shadow-card hover:shadow-luxury transition-all duration-300">
        <OptimizedImage
          src={currentImage.image_url}
          alt={`${productName} - صورة عالية الجودة ${selectedIndex + 1} من ${images.length} - منتجات لمسة بيوتي الطبيعية`}
          className="w-full"
          aspectRatio="1/1"
          priority={selectedIndex === 0}
        />
        
        {/* أزرار التنقل - تظهر فقط إذا كان هناك أكثر من صورة */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-gray-900/95 hover:bg-white dark:hover:bg-gray-900 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110"
              aria-label="الصورة السابقة"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 dark:bg-gray-900/95 hover:bg-white dark:hover:bg-gray-900 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110"
              aria-label="الصورة التالية"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* مؤشر عدد الصور */}
        {images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-semibold text-white shadow-lg">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* الصور المصغرة - تظهر فقط إذا كان هناك أكثر من صورة */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105",
                selectedIndex === index
                  ? "border-primary ring-4 ring-primary/20 shadow-md scale-105"
                  : "border-border hover:border-primary/50 opacity-70 hover:opacity-100"
              )}
              aria-label={`عرض الصورة ${index + 1}`}
            >
              <OptimizedImage
                src={image.image_url}
                alt={`${productName} - صورة مصغرة ${index + 1} - منتج طبيعي من لمسة بيوتي`}
                className="w-full h-full"
                aspectRatio="1/1"
              />
              {image.is_primary && (
                <div className="absolute top-1 right-1 bg-gradient-primary text-white text-xs px-2 py-1 rounded-md font-bold shadow-md">
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
