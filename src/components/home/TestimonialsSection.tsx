import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'أحمد محمد',
    avatar: '',
    rating: 5,
    text: 'منتجات رائعة وطبيعية 100%، جربت شامبو البار وكانت النتيجة مذهلة. شعري أصبح أكثر نعومة وحيوية.',
    date: 'منذ أسبوعين',
  },
  {
    id: 2,
    name: 'فاطمة علي',
    avatar: '',
    rating: 5,
    text: 'الشحن سريع والتغليف ممتاز. المنتجات الطبيعية من لمسة بيوتي غيرت روتين العناية بشعري تماماً.',
    date: 'منذ شهر',
  },
  {
    id: 3,
    name: 'خالد سعيد',
    avatar: '',
    rating: 5,
    text: 'أفضل متجر للمنتجات الطبيعية في السعودية. جودة عالية وأسعار مناسبة، أنصح به بشدة.',
    date: 'منذ 3 أيام',
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-secondary/30 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/8 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-primary/15">
            <Quote className="h-3.5 w-3.5" />
            آراء العملاء
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            ماذا يقول عملاؤنا
          </h2>
          <p className="text-muted-foreground text-sm">
            نفخر بثقة عملائنا وتجاربهم الإيجابية
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.id} 
              className="bg-white border border-gray-100 hover:border-primary/20 transition-all duration-300 hover:shadow-soft animate-fade-in rounded-2xl overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-5 relative">
                {/* Quote Icon */}
                <Quote className="h-6 w-6 text-primary/10 mb-3" />
                
                <p className="text-foreground/80 text-sm leading-relaxed mb-4">
                  {testimonial.text}
                </p>

                <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                  <Avatar className="h-9 w-9 border border-primary/10">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-primary/8 text-primary text-xs font-bold">
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-foreground">{testimonial.name}</h4>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  <span className="text-[11px] text-muted-foreground/50">
                    {testimonial.date}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
