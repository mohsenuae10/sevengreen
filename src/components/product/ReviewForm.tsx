import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted?: () => void;
}

export const ReviewForm = ({ productId, onReviewSubmitted }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('يرجى اختيار التقييم');
      return;
    }

    if (!customerName.trim()) {
      toast.error('يرجى إدخال اسمك');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim() || null,
        rating,
        review_text: reviewText.trim() || null,
        is_approved: false, // تحتاج موافقة الأدمن
      });

      if (error) throw error;

      toast.success('تم إرسال تقييمك بنجاح! سيظهر بعد المراجعة.');
      
      // إعادة تعيين النموذج
      setRating(0);
      setCustomerName('');
      setCustomerEmail('');
      setReviewText('');
      
      onReviewSubmitted?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('حدث خطأ أثناء إرسال التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">اكتب تقييمك</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>التقييم *</Label>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="customerName">الاسم *</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="أدخل اسمك"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="customerEmail">البريد الإلكتروني (اختياري)</Label>
          <Input
            id="customerEmail"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="example@email.com"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label htmlFor="reviewText">رأيك في المنتج (اختياري)</Label>
          <Textarea
            id="reviewText"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="شاركنا تجربتك مع هذا المنتج..."
            rows={4}
            disabled={isSubmitting}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
        </Button>
      </form>
    </Card>
  );
};
