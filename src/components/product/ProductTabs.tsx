import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Leaf, Info, Star, AlertTriangle } from "lucide-react";

interface ProductTabsProps {
  description?: string;
  ingredients?: string;
  howToUse?: string;
  benefits?: string;
  warnings?: string;
  sizeInfo?: string;
  madeIn?: string;
}

export function ProductTabs({
  description,
  ingredients,
  howToUse,
  benefits,
  warnings,
  sizeInfo,
  madeIn,
}: ProductTabsProps) {
  // إذا لم تكن هناك أي بيانات، لا نعرض المكون
  if (!description && !ingredients && !howToUse && !benefits) {
    return null;
  }

  return (
    <div className="mt-12 space-y-6">
      {/* وصف المنتج */}
      {description && (
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Info className="h-5 w-5 text-primary" />
              </div>
              وصف المنتج
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base">
              {description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* المكونات */}
      {ingredients && (
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              المكونات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base">
              {ingredients}
            </p>
          </CardContent>
        </Card>
      )}

      {/* طريقة الاستخدام */}
      {howToUse && (
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              طريقة الاستخدام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base">
              {howToUse}
            </p>
          </CardContent>
        </Card>
      )}

      {/* الفوائد */}
      {benefits && (
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              الفوائد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base">
              {benefits}
            </p>
          </CardContent>
        </Card>
      )}

      {/* التحذيرات */}
      {warnings && (
        <Card className="border-2 border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl text-amber-900 dark:text-amber-100">
              <div className="w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-900/50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-700 dark:text-amber-400" />
              </div>
              تحذيرات هامة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-800 dark:text-amber-200 leading-relaxed whitespace-pre-line text-base">
              {warnings}
            </p>
          </CardContent>
        </Card>
      )}

      {/* معلومات إضافية */}
      {(sizeInfo || madeIn) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {sizeInfo && (
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">الحجم والتعبئة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-base">{sizeInfo}</p>
              </CardContent>
            </Card>
          )}

          {madeIn && (
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">بلد المنشأ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-base">{madeIn}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
