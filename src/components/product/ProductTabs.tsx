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
    <section className="mt-12 space-y-6" aria-label="معلومات تفصيلية عن المنتج">
      {/* الوصف التفصيلي المحسّن للـ SEO */}
      {long_description_ar && (
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">وصف تفصيلي</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-foreground leading-relaxed whitespace-pre-line text-base" itemProp="description">
              {long_description_ar}
            </div>
          </CardContent>
        </Card>
      )}

      {/* المميزات الرئيسية */}
      {key_features && key_features.length > 0 && (
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">المميزات الرئيسية</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {key_features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-foreground leading-relaxed text-base">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* لماذا تختار هذا المنتج */}
      {why_choose && why_choose.length > 0 && (
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <h2 className="text-xl font-bold">لماذا تختار هذا المنتج؟</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {why_choose.map((reason, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-1.5 h-2 w-2 rounded-full bg-rose-600 dark:bg-rose-400 flex-shrink-0" />
                  <span className="text-foreground leading-relaxed text-base">{reason}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* الأسئلة الشائعة */}
      {faqs && faqs.length > 0 && (
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">الأسئلة الشائعة</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-right hover:text-primary">
                    <h3 className="text-base font-semibold">{faq.question}</h3>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
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
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">وصف المنتج</h2>
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
              <h2 className="text-xl font-bold">المكونات</h2>
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
              <h2 className="text-xl font-bold">طريقة الاستخدام</h2>
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
              <h2 className="text-xl font-bold">الفوائد</h2>
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
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-xl font-bold">تحذيرات</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-900 dark:text-amber-100 leading-relaxed whitespace-pre-line text-base">
              {warnings}
            </p>
          </CardContent>
        </Card>
      )}

      {/* معلومات الحجم */}
      {sizeInfo && (
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Ruler className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-bold">معلومات الحجم</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed text-base">
              {sizeInfo}
            </p>
          </CardContent>
        </Card>
      )}

      {/* بلد المنشأ */}
      {madeIn && (
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="text-xl font-bold">بلد المنشأ</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-base">
              صنع في: <span className="font-semibold">{madeIn}</span>
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
