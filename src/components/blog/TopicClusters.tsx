import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, BookOpen, Sparkles } from 'lucide-react';

interface TopicCluster {
  id: string;
  name: string;
  description: string;
  categorySlug: string;
  icon: React.ReactNode;
}

// Topic Clusters for Content Hub Strategy
const topicClusters: TopicCluster[] = [
  {
    id: 'hair-care-hub',
    name: 'العناية بالشعر',
    description: 'دليل شامل للعناية بالشعر: من علاج التساقط إلى روتين العناية اليومي',
    categorySlug: 'hair-care',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: 'skincare-hub',
    name: 'العناية بالبشرة',
    description: 'أسرار البشرة المثالية: تنظيف، ترطيب، وحماية من الشمس',
    categorySlug: 'skincare',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: 'body-care-hub',
    name: 'العناية بالجسم',
    description: 'روتين كامل للعناية بالجسم: تقشير، ترطيب، وعناية خاصة',
    categorySlug: 'body-care',
    icon: <Sparkles className="h-5 w-5" />,
  },
];

export const TopicClusters = () => {
  // Fetch recent posts for each topic cluster
  const { data: clusterPosts } = useQuery({
    queryKey: ['topic-cluster-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title_ar, slug, excerpt_ar, featured_image, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(9);
      
      if (error) throw error;
      return data;
    },
  });

  // Distribute posts across clusters
  const getClusterPosts = (index: number) => {
    if (!clusterPosts) return [];
    const startIndex = index * 3;
    return clusterPosts.slice(startIndex, startIndex + 3);
  };

  return (
    <section className="py-12 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <Badge variant="outline" className="mb-4">
            <BookOpen className="h-3 w-3 ml-1" />
            مراكز المحتوى
          </Badge>
          <h2 className="text-3xl font-bold mb-4">اكتشفي عالم الجمال الطبيعي</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            دليل شامل ومقالات متخصصة في كل ما يتعلق بالعناية بجمالك الطبيعي
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topicClusters.map((cluster, index) => (
            <Card key={cluster.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {cluster.icon}
                  </div>
                  <CardTitle className="text-xl">{cluster.name}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">{cluster.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-4">
                  {getClusterPosts(index).map((post) => (
                    <li key={post.id}>
                      <Link 
                        to={`/blog/${post.slug}`}
                        className="text-sm hover:text-primary transition-colors line-clamp-1 flex items-center gap-2"
                      >
                        <ChevronLeft className="h-3 w-3 flex-shrink-0" />
                        {post.title_ar}
                      </Link>
                    </li>
                  ))}
                </ul>
                
                {/* Hub Link - Strategic Internal Linking */}
                <div className="pt-4 border-t border-border">
                  <Link 
                    to={`/category/${cluster.categorySlug}`}
                    className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
                  >
                    تصفح منتجات {cluster.name}
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full hover:bg-primary/90 transition-colors"
          >
            عرض جميع المقالات
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
