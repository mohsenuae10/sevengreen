import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().trim().email({ message: "البريد الإلكتروني غير صحيح" });

export const NewsletterForm = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = emailSchema.safeParse(email);
    
    if (!result.success) {
      toast({
        title: 'خطأ',
        description: result.error.errors[0].message,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would normally send to a newsletter service
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'تم الاشتراك بنجاح!',
        description: 'شكراً لانضمامك إلى قائمتنا البريدية',
      });
      
      setEmail('');
    } catch (error) {
      toast({
        title: 'حدث خطأ',
        description: 'يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="بريدك الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          disabled={isSubmitting}
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={isSubmitting}
        >
          <Mail className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        اشترك ليصلك كل جديد من عروضنا ومنتجاتنا
      </p>
    </form>
  );
};
