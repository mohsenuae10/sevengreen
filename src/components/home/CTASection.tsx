import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShoppingBag, Sparkles } from 'lucide-react';

export const CTASection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-white space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="font-medium">ابدأ رحلتك مع Seven Green</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            جاهز لتجربة العناية الطبيعية؟
          </h2>
          
          <p className="text-xl text-white/90 leading-relaxed">
            انضم إلى آلاف العملاء السعداء واكتشف جمال المنتجات الطبيعية
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <Link to="/products">
                <ShoppingBag className="h-5 w-5 ml-2" />
                تسوق الآن
              </Link>
            </Button>
            
            <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm font-bold">
              <Link to="/products">
                استكشف المنتجات
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-accent mb-2">100%</p>
              <p className="text-white/80 text-sm">منتجات طبيعية</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-accent mb-2">1000+</p>
              <p className="text-white/80 text-sm">عميل سعيد</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-accent mb-2">50+</p>
              <p className="text-white/80 text-sm">منتج مميز</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
