import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, Headphones, Sparkles } from 'lucide-react';
import hairCareBanner from '@/assets/categories/hair-care-banner.jpg';
import skincareBanner from '@/assets/categories/skincare-banner.jpg';
import bodyCareBanner from '@/assets/categories/body-care-banner.jpg';

export const MainHeroBanner = () => {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background with multiple images */}
      <div className="absolute inset-0">
        <div className="grid grid-cols-3 h-full opacity-20">
          <img 
            src={hairCareBanner} 
            alt="العناية بالشعر" 
            className="w-full h-full object-cover"
          />
          <img 
            src={skincareBanner} 
            alt="العناية بالبشرة" 
            className="w-full h-full object-cover"
          />
          <img 
            src={bodyCareBanner} 
            alt="العناية بالجسم" 
            className="w-full h-full object-cover"
          />
        </div>
        {/* Gradient overlay - lighter colors */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/98 via-background/95 to-background/90"></div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">منتجات طبيعية 100%</span>
            </div>

            {/* Brand Name */}
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight text-primary">
                Seven Green
              </h1>
              <div className="h-1 w-24 bg-primary rounded-full"></div>
            </div>

            {/* Main Title */}
            <h2 className="text-3xl md:text-5xl font-bold leading-tight text-foreground">
              اكتشف عالم الجمال الطبيعي
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              منتجات طبيعية 100% للعناية بالشعر والبشرة والجسم من أجود المكونات الطبيعية. 
              جمالك يبدأ من الطبيعة.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Link to="/products">تسوق الآن</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="font-bold transition-all hover:scale-105"
              >
                <Link to="/about">تعرف على المزيد</Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              <div className="flex items-center gap-2 bg-primary/5 px-3 py-2 rounded-lg border border-primary/10">
                <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">طبيعي 100%</span>
              </div>
              <div className="flex items-center gap-2 bg-primary/5 px-3 py-2 rounded-lg border border-primary/10">
                <Truck className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">شحن مجاني</span>
              </div>
              <div className="flex items-center gap-2 bg-primary/5 px-3 py-2 rounded-lg border border-primary/10">
                <RefreshCw className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">إرجاع سهل</span>
              </div>
              <div className="flex items-center gap-2 bg-primary/5 px-3 py-2 rounded-lg border border-primary/10">
                <Headphones className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">دعم 24/7</span>
              </div>
            </div>
          </div>

          {/* Visual Element - Product Images */}
          <div className="relative hidden lg:block animate-scale-in">
            <div className="grid grid-cols-2 gap-4">
              {/* Top left image */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl group">
                <img 
                  src={hairCareBanner} 
                  alt="منتجات العناية بالشعر" 
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent flex items-end p-4">
                  <span className="text-white font-bold">العناية بالشعر</span>
                </div>
              </div>
              
              {/* Top right image */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl group mt-8">
                <img 
                  src={skincareBanner} 
                  alt="منتجات العناية بالبشرة" 
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent flex items-end p-4">
                  <span className="text-white font-bold">العناية بالبشرة</span>
                </div>
              </div>
              
              {/* Bottom full width image */}
              <div className="col-span-2 relative rounded-2xl overflow-hidden shadow-xl group">
                <img 
                  src={bodyCareBanner} 
                  alt="منتجات العناية بالجسم" 
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent flex items-end p-4">
                  <span className="text-white font-bold">العناية بالجسم</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

