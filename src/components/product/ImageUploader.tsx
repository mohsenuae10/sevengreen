import { useState, useCallback } from 'react';
import { Upload, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/OptimizedImage';

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface ImageUploaderProps {
  onImagesChange: (files: File[]) => void;
  maxImages?: number;
}

export const ImageUploader = ({ onImagesChange, maxImages = 10 }: ImageUploaderProps) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newImages: ImageFile[] = [];
    const remainingSlots = maxImages - images.length;
    const filesToAdd = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToAdd; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        newImages.push({
          file,
          preview: URL.createObjectURL(file),
          id: Math.random().toString(36).substring(7),
        });
      }
    }

    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    onImagesChange(updatedImages.map(img => img.file));
  }, [images, maxImages, onImagesChange]);

  const removeImage = (id: string) => {
    const updatedImages = images.filter(img => {
      if (img.id === id) {
        URL.revokeObjectURL(img.preview);
        return false;
      }
      return true;
    });
    setImages(updatedImages);
    onImagesChange(updatedImages.map(img => img.file));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="space-y-4">
      {/* منطقة السحب والإفلات */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          images.length >= maxImages && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          id="image-upload"
          disabled={images.length >= maxImages}
        />
        <label
          htmlFor="image-upload"
          className={cn(
            "flex flex-col items-center gap-2 cursor-pointer",
            images.length >= maxImages && "cursor-not-allowed"
          )}
        >
          <Upload className="w-10 h-10 text-muted-foreground" />
          <div className="space-y-1">
            <p className="font-medium">اسحب الصور هنا أو اضغط للاختيار</p>
            <p className="text-sm text-muted-foreground">
              {images.length} / {maxImages} صور
            </p>
          </div>
        </label>
      </div>

      {/* معاينة الصور المحددة */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-border">
                <OptimizedImage
                  src={image.preview}
                  alt={`معاينة ${index + 1}`}
                  className="w-full h-full"
                  aspectRatio="1/1"
                />
              </div>
              
              {/* زر الحذف */}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(image.id)}
              >
                <X className="w-4 h-4" />
              </Button>

              {/* مؤشر الصورة الأولى (الرئيسية) */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  رئيسية
                </div>
              )}

              {/* مقبض السحب (للنسخة المستقبلية) */}
              <div className="absolute bottom-2 left-2 bg-background/80 p-1 rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          الصورة الأولى ستكون الصورة الرئيسية للمنتج
        </p>
      )}
    </div>
  );
};
