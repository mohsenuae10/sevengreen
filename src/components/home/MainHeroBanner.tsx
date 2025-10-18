import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const MainHeroBanner = () => {
  return (
    <section className="relative bg-background border-b">
      <div className="container mx-auto px-4 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Logo/Brand */}
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-primary tracking-tight">
              Seven Green
            </h1>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
          </div>

          {/* Simple tagline */}
          <p className="text-xl md:text-2xl text-muted-foreground font-light">
            جمالك الطبيعي يبدأ من هنا
          </p>

          {/* Single CTA */}
          <div className="pt-4">
            <Button
              asChild
              size="lg"
              className="font-bold text-lg px-12 py-6 h-auto shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Link to="/products">تسوق الآن</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

