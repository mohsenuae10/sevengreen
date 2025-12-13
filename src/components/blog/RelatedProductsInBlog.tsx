import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag } from 'lucide-react';

interface RelatedProductsInBlogProps {
  categorySlug?: string;
  limit?: number;
}

export const RelatedProductsInBlog = ({ categorySlug, limit = 4 }: RelatedProductsInBlogProps) => {
  const { data: products } = useQuery({
    queryKey: ['blog-related-products', categorySlug],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('id, name_ar, price, image_url, category_ar, slug')
        .eq('is_active', true)
        .limit(limit);
      
      if (categorySlug) {
        query = query.eq('category', categorySlug);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Shuffle for variety
      return data?.sort(() => 0.5 - Math.random()) || [];
    },
  });

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="my-8 p-6 bg-muted/30 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-lg">المنتجات المذكورة في المقال</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link 
            key={product.id} 
            to={`/product/${product.slug || product.id}`}
            className="group"
          >
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square overflow-hidden bg-muted">
                {product.image_url && (
                  <img 
                    src={product.image_url} 
                    alt={product.name_ar}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              <CardContent className="p-3">
                <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name_ar}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-primary font-bold text-sm">{product.price} ريال</span>
                  {product.category_ar && (
                    <Badge variant="outline" className="text-xs">
                      {product.category_ar}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      <div className="text-center mt-4">
        <Link 
          to="/products" 
          className="text-primary hover:underline text-sm font-medium"
        >
          تصفح جميع المنتجات ←
        </Link>
      </div>
    </div>
  );
};
