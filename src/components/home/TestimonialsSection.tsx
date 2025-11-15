import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
    text: 'الشحن سريع والتغليف ممتاز. المنتجات الطبيعية من لمسة الجمال غيرت روتين العناية بشعري تماماً.',
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
    <section className="py-20 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
            <Quote className="h-4 w-4 ml-2" />
            آراء العملاء
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            ماذا يقول عملاؤنا
          </h2>
          <p className="text-muted-foreground text-lg">
            نفخر بثقة عملائنا وتجاربهم الإيجابية
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={testimonial.id} 
              className="relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-xl animate-fade-in group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/5 rounded-bl-full"></div>
              
              <CardContent className="p-6 relative">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-14 w-14 border-2 border-primary/20">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-foreground">{testimonial.name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                  </div>
                </div>

                <Quote className="h-8 w-8 text-primary/20 mb-3" />
                
                <p className="text-muted-foreground leading-relaxed mb-4">
                  "{testimonial.text}"
                </p>

                <p className="text-sm text-muted-foreground/60">
                  {testimonial.date}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
