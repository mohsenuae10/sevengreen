import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Percent, Sparkles, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import skincareOffer from '@/assets/offers/gulf-woman-skincare.jpg';
import haircareOffer from '@/assets/offers/gulf-woman-haircare.jpg';

export const SpecialOffers = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-secondary/20 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <Badge className="mb-4 bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/20 px-4 py-1">
            <Sparkles className="h-4 w-4 ml-2 animate-pulse" />
            عروض خاصة ومميزة
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent mb-4">
            عروض لا تُفوّت
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            استفد من عروضنا المميزة على منتجاتنا الطبيعية الفاخرة
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Offer 1: Buy 1 Get 1 with Image */}
          <div className="group relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 hover:scale-[1.02] animate-fade-in">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={skincareOffer} 
                alt="عرض العناية بالبشرة - منتجات طبيعية"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary-dark/95"></div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10 p-10 text-white">
              {/* Icon Badge */}
              <div className="bg-white/20 backdrop-blur-md w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border border-white/30 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Gift className="h-10 w-10 text-accent" />
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                عرض 1 + 1 مجاناً
              </h3>
              <p className="text-white/95 mb-6 text-lg leading-relaxed">
                اشتري أي منتجين من منتجاتنا المميزة واحصل على منتج ثالث مجاناً
              </p>
              
              <div className="flex gap-3 mb-8">
                <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold shadow-lg px-3 py-1 text-sm">
                  🎁 عرض محدود
                </Badge>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border border-white/30 font-bold px-3 py-1 text-sm">
                  ✨ الأكثر طلباً
                </Badge>
              </div>
              
              <Button asChild className="bg-white text-primary hover:bg-white/95 font-bold w-full h-12 text-base rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 group/btn">
                <Link to="/products">
                  <span>تسوق الآن</span>
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Offer 2: Discount with Image */}
          <div className="group relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 hover:scale-[1.02] animate-fade-in" style={{ animationDelay: '0.15s' }}>
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={haircareOffer} 
                alt="عرض العناية بالشعر - خصومات حصرية"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-accent/98 via-accent/95 to-primary/90"></div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-700"></div>
            
            <div className="relative z-10 p-10 text-primary">
              {/* Icon Badge */}
              <div className="bg-primary/20 backdrop-blur-md w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border border-primary/30 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <Percent className="h-10 w-10 text-primary" />
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                خصومات تصل إلى 30%
              </h3>
              <p className="text-primary/95 mb-6 text-lg leading-relaxed">
                خصومات حصرية على مجموعة مختارة من أفضل منتجاتنا الطبيعية
              </p>
              
              <div className="flex gap-3 mb-8">
                <Badge className="bg-gradient-to-r from-primary to-primary-dark text-white font-bold shadow-lg px-3 py-1 text-sm">
                  💰 وفّر الآن
                </Badge>
                <Badge className="bg-white/80 backdrop-blur-sm text-primary border border-primary/20 font-bold px-3 py-1 text-sm">
                  ⚡ عروض سريعة
                </Badge>
              </div>
              
              <Button asChild className="bg-gradient-to-r from-primary to-primary-dark text-white hover:from-primary-dark hover:to-primary font-bold w-full h-12 text-base rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 group/btn">
                <Link to="/products">
                  <span>استكشف المنتجات</span>
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
