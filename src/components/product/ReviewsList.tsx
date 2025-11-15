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
        <Card className="p-6 bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold">{ratingStats.average_rating}</div>
              <div className="flex justify-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(ratingStats.average_rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                بناءً على {ratingStats.review_count} تقييم
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* قائمة التقييمات */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarFallback>
                  {review.customer_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{review.customer_name}</h4>
                  {review.is_verified && (
                    <Badge variant="secondary" className="text-xs">
                      مشتري موثق
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(review.created_at), 'dd MMMM yyyy', { locale: ar })}
                  </span>
                </div>

                {review.review_text && (
                  <p className="text-foreground mb-3 leading-relaxed">
                    {review.review_text}
                  </p>
                )}

                {review.helpful_count > 0 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{review.helpful_count} وجدوا هذا التقييم مفيداً</span>
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
