import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Leaf, Info, Star } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
    <div className="container mx-auto px-4 py-8">
      {/* Desktop Tabs */}
      <Card className="hidden md:block w-full">
        <Tabs defaultValue="description" dir="rtl" className="w-full">
          <TabsList className="w-full grid grid-cols-4 gap-2 bg-muted p-2 rounded-t-lg h-auto">
            {description && (
              <TabsTrigger value="description" className="flex items-center gap-2 py-3">
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">وصف المنتج</span>
                <span className="sm:hidden">الوصف</span>
              </TabsTrigger>
            )}
            {ingredients && (
              <TabsTrigger value="ingredients" className="flex items-center gap-2 py-3">
                <Leaf className="h-4 w-4" />
                <span className="hidden sm:inline">المكونات</span>
                <span className="sm:hidden">مكونات</span>
              </TabsTrigger>
            )}
            {howToUse && (
              <TabsTrigger value="usage" className="flex items-center gap-2 py-3">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">طريقة الاستخدام</span>
                <span className="sm:hidden">استخدام</span>
              </TabsTrigger>
            )}
            {(benefits || warnings || sizeInfo || madeIn) && (
              <TabsTrigger value="info" className="flex items-center gap-2 py-3">
                <Star className="h-4 w-4" />
                <span className="hidden sm:inline">معلومات إضافية</span>
                <span className="sm:hidden">معلومات</span>
              </TabsTrigger>
            )}
          </TabsList>

          <CardContent className="p-6 min-h-[200px]">
            {description && (
              <TabsContent value="description" className="mt-0">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-xl font-bold mb-4">وصف المنتج</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {description}
                  </p>
                </div>
              </TabsContent>
            )}

            {ingredients && (
              <TabsContent value="ingredients" className="mt-0">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-primary" />
                    المكونات
                  </h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {ingredients}
                  </p>
                </div>
              </TabsContent>
            )}

            {howToUse && (
              <TabsContent value="usage" className="mt-0">
                <div className="prose prose-sm max-w-none">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    طريقة الاستخدام
                  </h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {howToUse}
                  </p>
                </div>
              </TabsContent>
            )}

            {(benefits || warnings || sizeInfo || madeIn) && (
              <TabsContent value="info" className="mt-0">
                <div className="prose prose-sm max-w-none space-y-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    معلومات إضافية
                  </h3>
                  
                  {benefits && (
                    <div>
                      <h4 className="font-semibold text-lg mb-2">الفوائد</h4>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                        {benefits}
                      </p>
                    </div>
                  )}

                  {warnings && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                      <h4 className="font-semibold text-lg mb-2 text-amber-900 dark:text-amber-100">
                        ⚠️ تحذيرات
                      </h4>
                      <p className="text-amber-800 dark:text-amber-200 leading-relaxed whitespace-pre-line">
                        {warnings}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sizeInfo && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-1">الحجم</h4>
                        <p className="text-muted-foreground">{sizeInfo}</p>
                      </div>
                    )}

                    {madeIn && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-1">بلد المنشأ</h4>
                        <p className="text-muted-foreground">{madeIn}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            )}
          </CardContent>
        </Tabs>
      </Card>

      {/* Mobile Accordion */}
      <Card className="md:hidden w-full">
        <CardContent className="p-4">
          <Accordion type="single" collapsible className="w-full" dir="rtl">
            {description && (
              <AccordionItem value="description">
                <AccordionTrigger className="text-base">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>وصف المنتج</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {description}
                  </p>
                </AccordionContent>
              </AccordionItem>
            )}

            {ingredients && (
              <AccordionItem value="ingredients">
                <AccordionTrigger className="text-base">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4" />
                    <span>المكونات</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {ingredients}
                  </p>
                </AccordionContent>
              </AccordionItem>
            )}

            {howToUse && (
              <AccordionItem value="usage">
                <AccordionTrigger className="text-base">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span>طريقة الاستخدام</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {howToUse}
                  </p>
                </AccordionContent>
              </AccordionItem>
            )}

            {(benefits || warnings || sizeInfo || madeIn) && (
              <AccordionItem value="info">
                <AccordionTrigger className="text-base">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>معلومات إضافية</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {benefits && (
                      <div>
                        <h4 className="font-semibold mb-2">الفوائد</h4>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {benefits}
                        </p>
                      </div>
                    )}

                    {warnings && (
                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
                        <h4 className="font-semibold mb-2 text-amber-900 dark:text-amber-100">
                          ⚠️ تحذيرات
                        </h4>
                        <p className="text-amber-800 dark:text-amber-200 leading-relaxed whitespace-pre-line text-sm">
                          {warnings}
                        </p>
                      </div>
                    )}

                    {sizeInfo && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <h4 className="font-semibold mb-1">الحجم</h4>
                        <p className="text-muted-foreground text-sm">{sizeInfo}</p>
                      </div>
                    )}

                    {madeIn && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <h4 className="font-semibold mb-1">بلد المنشأ</h4>
                        <p className="text-muted-foreground text-sm">{madeIn}</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
