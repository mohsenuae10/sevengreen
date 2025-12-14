import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Leaf, Info, Star, AlertTriangle, Ruler, MapPin, FileText, Heart, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface ProductTabsProps {
  description?: string;
  long_description_ar?: string;
  ingredients?: string;
  howToUse?: string;
  benefits?: string;
  warnings?: string;
  sizeInfo?: string;
  madeIn?: string;
  key_features?: string[];
  why_choose?: string[];
  faqs?: Array<{ question: string; answer: string }>;
}

export function ProductTabs({
  description,
  long_description_ar,
  ingredients,
  howToUse,
  benefits,
  warnings,
  sizeInfo,
  madeIn,
  key_features,
  why_choose,
  faqs,
}: ProductTabsProps) {
  // إذا لم تكن هناك أي بيانات، لا نعرض المكون
  if (!description && !long_description_ar && !ingredients && !howToUse && !benefits && !key_features?.length && !why_choose?.length && !faqs?.length) {
    return null;
  }

  return (
    <section className="mt-16 space-y-6" aria-label="معلومات تفصيلية عن المنتج">
      {/* الوصف التفصيلي المحسّن للـ SEO */}
      {long_description_ar && (
        <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-soft overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">وصف تفصيلي</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-line text-base" itemProp="description">
              {long_description_ar}
            </div>
          </CardContent>
        </Card>
      )}

      {/* المميزات الرئيسية */}
      {key_features && key_features.length > 0 && (
        <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-soft overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">المميزات الرئيسية</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-4">
              {key_features.map((feature, index) => (
                <li key={index} className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent hover:from-primary/10 transition-colors">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-primary flex-shrink-0 shadow-sm" />
                  <span className="text-foreground leading-relaxed text-base font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* لماذا تختار هذا المنتج */}
      {why_choose && why_choose.length > 0 && (
        <Card className="border-2 hover:border-rose-300 dark:hover:border-rose-700 transition-all duration-300 hover:shadow-soft overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">لماذا تختار هذا المنتج؟</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-4">
              {why_choose.map((reason, index) => (
                <li key={index} className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-rose-50 to-transparent dark:from-rose-950/10 hover:from-rose-100 dark:hover:from-rose-950/20 transition-colors">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex-shrink-0 shadow-sm" />
                  <span className="text-foreground leading-relaxed text-base font-medium">{reason}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* الأسئلة الشائعة */}
      {faqs && faqs.length > 0 && (
        <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-soft overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
                <Info className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">الأسئلة الشائعة</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/50 last:border-0">
                  <AccordionTrigger className="text-right hover:text-primary transition-colors py-4">
                    <span className="text-base font-bold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-4 text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* وصف المنتج (القديم) */}
      {description && (
        <Card className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-soft overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-md">
                <Info className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">وصف المنتج</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base">
              {description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* المكونات */}
      {ingredients && (
        <Card className="border-2 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 hover:shadow-soft overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">المكونات</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base">
              {ingredients}
            </p>
          </CardContent>
        </Card>
      )}

      {/* طريقة الاستخدام */}
      {howToUse && (
        <Card className="border-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-soft overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center shadow-md">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">طريقة الاستخدام</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base">
              {howToUse}
            </p>
          </CardContent>
        </Card>
      )}

      {/* الفوائد */}
      {benefits && (
        <Card className="border-2 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300 hover:shadow-soft overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-md">
                <Star className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">الفوائد</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base">
              {benefits}
            </p>
          </CardContent>
        </Card>
      )}

      {/* التحذيرات */}
      {warnings && (
        <Card className="border-2 border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 hover:shadow-soft transition-all duration-300 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
            <CardTitle className="flex items-center gap-3 text-xl text-amber-900 dark:text-amber-100">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">تحذيرات</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-amber-900 dark:text-amber-100 leading-relaxed whitespace-pre-line text-base">
              {warnings}
            </p>
          </CardContent>
        </Card>
      )}

      {/* معلومات الحجم */}
      {sizeInfo && (
        <Card className="border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 hover:shadow-soft overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                <Ruler className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">معلومات الحجم</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed text-base">
              {sizeInfo}
            </p>
          </CardContent>
        </Card>
      )}

      {/* بلد المنشأ */}
      {madeIn && (
        <Card className="border-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 hover:shadow-soft overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-gray-700 flex items-center justify-center shadow-md">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">بلد المنشأ</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-base">
              صنع في: <span className="font-bold text-lg text-foreground">{madeIn}</span>
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
