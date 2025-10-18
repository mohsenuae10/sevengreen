import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, Headphones, Sparkles } from 'lucide-react';

export const MainHeroBanner = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary/95 via-primary to-primary-dark overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white space-y-6 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">منتجات طبيعية 100%</span>
            </div>

            {/* Brand Name */}
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Seven Green
              </h1>
              <div className="h-1 w-24 bg-accent rounded-full"></div>
            </div>

            {/* Main Title */}
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              اكتشف عالم الجمال الطبيعي
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              منتجات طبيعية 100% للعناية بالشعر والبشرة والجسم من أجود المكونات الطبيعية. 
              جمالك يبدأ من الطبيعة.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="bg-accent text-primary hover:bg-accent/90 font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Link to="/products">تسوق الآن</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white/30 bg-white/10 text-white hover:bg-white hover:text-primary backdrop-blur-sm font-bold transition-all hover:scale-105"
              >
                <Link to="/about">تعرف على المزيد</Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                <ShieldCheck className="h-5 w-5 text-accent flex-shrink-0" />
                <span className="text-sm font-medium">طبيعي 100%</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                <Truck className="h-5 w-5 text-accent flex-shrink-0" />
                <span className="text-sm font-medium">شحن مجاني</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                <RefreshCw className="h-5 w-5 text-accent flex-shrink-0" />
                <span className="text-sm font-medium">إرجاع سهل</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                <Headphones className="h-5 w-5 text-accent flex-shrink-0" />
                <span className="text-sm font-medium">دعم 24/7</span>
              </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative hidden lg:block animate-scale-in">
            <div className="relative">
              {/* Decorative circles */}
              <div className="absolute -top-8 -right-8 w-72 h-72 bg-accent/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-8 -left-8 w-72 h-72 bg-white/10 rounded-full blur-2xl"></div>
              
              {/* Main visual - placeholder for product image */}
              <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="aspect-square bg-gradient-to-br from-accent/30 to-white/20 rounded-2xl flex items-center justify-center">
                  <Sparkles className="h-32 w-32 text-white/60" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
