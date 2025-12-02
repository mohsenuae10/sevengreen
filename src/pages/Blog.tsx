import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEO/SEOHead';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Eye, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const Blog = () => {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const tagSlug = searchParams.get('tag');

  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts', categorySlug, tagSlug],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories(name_ar, slug)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (categorySlug) {
        const { data: category } = await supabase
          .from('blog_categories')
          .select('id')
          .eq('slug', categorySlug)
          .single();
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: tags } = useQuery({
    queryKey: ['blog-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name_ar');
      if (error) throw error;
      return data;
    },
  });

  const breadcrumbItems = [
    { name: 'الرئيسية', url: '/' },
    { name: 'المدونة', url: '/blog' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="مدونة لمسة بيوتي | نصائح العناية بالبشرة والشعر"
        description="اكتشف أحدث نصائح العناية بالبشرة والشعر، مراجعات المنتجات، وأسرار الجمال من خبراء لمسة بيوتي."
        keywords="مدونة جمال، نصائح بشرة، العناية بالشعر، منتجات تجميل، روتين العناية"
        url="https://lamsetbeauty.com/blog"
      />
      <BreadcrumbSchema items={breadcrumbItems} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">مدونة لمسة بيوتي</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            اكتشفي أسرار الجمال والعناية الطبيعية مع مقالاتنا المتخصصة
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Categories */}
            <Card>
              <CardHeader className="pb-3">
                <h2 className="font-semibold text-lg">التصنيفات</h2>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/blog"
                      className={`block text-sm hover:text-primary transition-colors ${!categorySlug ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                    >
                      جميع المقالات
                    </Link>
                  </li>
                  {categories?.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        to={`/blog?category=${cat.slug}`}
                        className={`block text-sm hover:text-primary transition-colors ${categorySlug === cat.slug ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                      >
                        {cat.name_ar}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <h2 className="font-semibold text-lg">الوسوم</h2>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Link key={tag.id} to={`/blog?tag=${tag.slug}`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                          <Tag className="h-3 w-3 ml-1" />
                          {tag.name_ar}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Posts Grid */}
          <main className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                      {post.featured_image && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={post.featured_image}
                            alt={post.title_ar}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        {post.blog_categories && (
                          <Badge variant="secondary" className="mb-2">
                            {post.blog_categories.name_ar}
                          </Badge>
                        )}
                        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title_ar}
                        </h3>
                        {post.excerpt_ar && (
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                            {post.excerpt_ar}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {post.published_at && format(new Date(post.published_at), 'd MMMM yyyy', { locale: ar })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.reading_time} دقيقة
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.views}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">لا توجد مقالات حالياً</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Blog;
