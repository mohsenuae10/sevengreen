import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';
import { OptimizedImage } from '@/components/OptimizedImage';

interface HeroBannerProps {
  product?: {
    id: string;
    name_ar: string;
    description_ar: string;
    image_url: string;
    price: number;
  };
}

export const HeroBanner = ({ product }: HeroBannerProps) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-20 md:py-32">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">منتجات طبيعية 100%</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              لمسة الجمال
              <span className="block text-accent mt-2">Lamset Beauty</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              اكتشفي سر الجمال الطبيعي مع منتجاتنا المميزة
              <br />
              عناية فاخرة للبشرة والشعر، جمال يدوم
            </p>
            
            {product && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                <p className="text-sm text-white/80 mb-1">المنتج المميز</p>
                <p className="font-bold text-xl">{product.name_ar}</p>
                <p className="text-accent text-2xl font-bold mt-2">{product.price} ريال</p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-primary font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <Link to="/products">
                  تسوق الآن
                </Link>
              </Button>
              
              {product && (
                <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <Link to={`/products/${product.id}`}>
                    عرض المنتج المميز
                  </Link>
                </Button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/20">
              <div className="flex items-center gap-2 text-white/90">
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                </div>
                <span className="text-sm font-medium">طبيعي 100%</span>
              </div>
              
              <div className="flex items-center gap-2 text-white/90">
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                  <Truck className="h-5 w-5 text-accent" />
                </div>
                <span className="text-sm font-medium">شحن مجاني</span>
              </div>
              
              <div className="flex items-center gap-2 text-white/90">
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                  <RefreshCw className="h-5 w-5 text-accent" />
                </div>
                <span className="text-sm font-medium">إرجاع مجاني</span>
              </div>
              
              <div className="flex items-center gap-2 text-white/90">
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                  <Headphones className="h-5 w-5 text-accent" />
                </div>
                <span className="text-sm font-medium">دعم 24/7</span>
              </div>
            </div>
          </div>
          
          <div className="relative animate-scale-in">
            {product?.image_url ? (
              <div className="relative group">
                <div className="absolute inset-0 bg-accent/20 rounded-3xl blur-3xl group-hover:blur-2xl transition-all"></div>
                <div className="relative rounded-3xl shadow-2xl w-full max-w-md mx-auto transform group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                  <OptimizedImage
                    src={product.image_url}
                    alt={`${product.name_ar} - منتج طبيعي مميز من لمسة الجمال`}
                    className="w-full"
                    aspectRatio="4/3"
                    priority={true}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl h-96 flex items-center justify-center border border-white/20">
                <Sparkles className="h-24 w-24 text-accent" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
