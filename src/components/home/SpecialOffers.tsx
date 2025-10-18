import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Percent, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SpecialOffers = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-accent/5 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
            <Sparkles className="h-4 w-4 ml-2" />
            عروض خاصة
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            عروض لا تُفوّت
          </h2>
          <p className="text-muted-foreground text-lg">
            استفد من عروضنا المميزة الآن
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Offer 1: Buy 1 Get 1 */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 animate-fade-in">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative z-10">
              <div className="bg-accent/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Gift className="h-8 w-8 text-accent" />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                عرض 1 + 1
              </h3>
              <p className="text-white/90 mb-6 text-lg">
                اشتري أي منتجين واحصل على منتج ثالث مجاناً
              </p>
              
              <Badge className="bg-accent text-primary font-bold mb-6">
                عرض محدود
              </Badge>
              
              <Button asChild className="bg-white text-primary hover:bg-white/90 font-bold w-full">
                <Link to="/products">
                  تسوق الآن
                </Link>
              </Button>
            </div>
          </div>

          {/* Offer 2: Discount */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent to-accent/80 p-8 text-primary shadow-xl hover:shadow-2xl transition-all hover:scale-105 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative z-10">
              <div className="bg-primary/10 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Percent className="h-8 w-8 text-primary" />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-3">
                خصومات تصل إلى 30%
              </h3>
              <p className="text-primary/90 mb-6 text-lg">
                خصومات حصرية على مجموعة مختارة من المنتجات
              </p>
              
              <Badge className="bg-primary text-white font-bold mb-6">
                وفّر الآن
              </Badge>
              
              <Button asChild variant="secondary" className="bg-white text-primary hover:bg-white/90 font-bold w-full">
                <Link to="/products">
                  استكشف المنتجات
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
