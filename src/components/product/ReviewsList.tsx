import { useQuery } from '@tanstack/react-query';
import { Star, ThumbsUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string | null;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
}

interface ReviewsListProps {
  productId: string;
}

export const ReviewsList = ({ productId }: ReviewsListProps) => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Review[];
    },
  });

  const { data: ratingStats } = useQuery({
    queryKey: ['rating-stats', productId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_product_rating', {
        product_uuid: productId,
      });

      if (error) throw error;
      return data?.[0] || { average_rating: 0, review_count: 0 };
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* إحصائيات التقييمات */}
      {ratingStats && ratingStats.review_count > 0 && (
        <Card className="p-8 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/20 shadow-soft">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">{ratingStats.average_rating}</div>
              <div className="flex justify-center gap-1 my-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= Math.round(ratingStats.average_rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm font-semibold text-muted-foreground">
                بناءً على {ratingStats.review_count} تقييم
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* قائمة التقييمات */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-6 hover:shadow-soft transition-all duration-300 border-2 hover:border-primary/30">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="bg-gradient-primary text-white font-bold text-lg">
                  {review.customer_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-bold text-lg">{review.customer_name}</h4>
                  {review.is_verified && (
                    <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                      ✓ مشتري موثق
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    {format(new Date(review.created_at), 'dd MMMM yyyy', { locale: ar })}
                  </span>
                </div>

                {review.review_text && (
                  <p className="text-foreground mb-3 leading-relaxed text-base bg-muted/30 p-4 rounded-lg">
                    {review.review_text}
                  </p>
                )}

                {review.helpful_count > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ThumbsUp className="h-4 w-4 text-primary" />
                    <span className="font-medium">{review.helpful_count} وجدوا هذا التقييم مفيداً</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
