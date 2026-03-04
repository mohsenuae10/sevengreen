import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles, Star } from 'lucide-react';

export const CTASection = () => {
  return (
    <section className="py-16 relative overflow-hidden">
      {/* Elegant Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-primary-light"></div>
      
      {/* Subtle Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 right-10 w-40 h-40 border border-white rounded-full"></div>
        <div className="absolute bottom-10 left-10 w-60 h-60 border border-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white/50 rounded-full"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center text-white space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full border border-white/15 text-sm">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="font-medium">ابدأ رحلتك مع لمسة بيوتي</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            جاهزة لتجربة الجمال الفاخر؟
          </h2>
          
          <p className="text-base text-white/80 leading-relaxed max-w-lg mx-auto">
            انضمي إلى آلاف العملاء السعداء واكتشفي سر الجمال الدائم
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Button asChild size="lg" className="bg-white hover:bg-white/90 text-primary font-bold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
              <Link to="/products">
                <ShoppingBag className="h-5 w-5 ml-2" />
                تسوق الآن
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="bg-transparent hover:bg-white/10 text-white border-white/25 hover:border-white/40 font-medium rounded-xl">
              <Link to="/products">
                استكشف المنتجات
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-6 pt-10 max-w-md mx-auto">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-accent mb-1">100%</p>
              <p className="text-white/60 text-xs">منتجات طبيعية</p>
            </div>
            <div className="text-center border-x border-white/10">
              <p className="text-2xl md:text-3xl font-bold text-accent mb-1">1000+</p>
              <p className="text-white/60 text-xs">عميل سعيد</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-accent mb-1">50+</p>
              <p className="text-white/60 text-xs">منتج مميز</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
