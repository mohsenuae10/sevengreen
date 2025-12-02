import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEO/SEOHead';
import { ArticleSchema } from '@/components/SEO/ArticleSchema';
import { BreadcrumbSchema } from '@/components/SEO/BreadcrumbSchema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Eye, ArrowRight, Share2, Facebook, Twitter } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useEffect } from 'react';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories(name_ar, slug)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Increment view count
  useEffect(() => {
    if (post?.id) {
      supabase
        .from('blog_posts')
        .update({ views: (post.views || 0) + 1 })
        .eq('id', post.id)
        .then();
    }
  }, [post?.id]);

  const { data: relatedPosts } = useQuery({
    queryKey: ['related-posts', post?.category_id, post?.id],
    queryFn: async () => {
      if (!post?.category_id) return [];
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title_ar, slug, featured_image, published_at')
        .eq('status', 'published')
        .eq('category_id', post.category_id)
        .neq('id', post.id)
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!post?.category_id,
  });

  const { data: postTags } = useQuery({
    queryKey: ['post-tags', post?.id],
    queryFn: async () => {
      if (!post?.id) return [];
      const { data, error } = await supabase
        .from('blog_post_tags')
        .select('blog_tags(id, name_ar, slug)')
        .eq('post_id', post.id);
      
      if (error) throw error;
      return data?.map(pt => pt.blog_tags) || [];
    },
    enabled: !!post?.id,
  });

  if (error) {
    navigate('/blog');
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">المقال غير موجود</h1>
        <Link to="/blog">
          <Button>العودة للمدونة</Button>
        </Link>
      </div>
    );
  }

  const breadcrumbItems = [
    { name: 'الرئيسية', url: '/' },
    { name: 'المدونة', url: '/blog' },
    ...(post.blog_categories ? [{ name: post.blog_categories.name_ar, url: `/blog?category=${post.blog_categories.slug}` }] : []),
    { name: post.title_ar, url: `/blog/${post.slug}` },
  ];

  const shareUrl = `https://lamsetbeauty.com/blog/${post.slug}`;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={post.meta_title || `${post.title_ar} | مدونة لمسة بيوتي`}
        description={post.meta_description || post.excerpt_ar || ''}
        keywords={post.meta_keywords || ''}
        url={shareUrl}
        image={post.featured_image || undefined}
      />
      <ArticleSchema
        title={post.title_ar}
        description={post.excerpt_ar || ''}
        image={post.featured_image || undefined}
        datePublished={post.published_at || post.created_at || ''}
        dateModified={post.updated_at || undefined}
        slug={post.slug}
      />
      <BreadcrumbSchema items={breadcrumbItems} />

      <article className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6">
          <ArrowRight className="h-4 w-4" />
          العودة للمدونة
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <header className="mb-8">
              {post.blog_categories && (
                <Link to={`/blog?category=${post.blog_categories.slug}`}>
                  <Badge variant="secondary" className="mb-4">
                    {post.blog_categories.name_ar}
                  </Badge>
                </Link>
              )}
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title_ar}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {post.published_at && format(new Date(post.published_at), 'd MMMM yyyy', { locale: ar })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.reading_time} دقيقة للقراءة
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.views} مشاهدة
                </span>
              </div>
            </header>

            {/* Featured Image */}
            {post.featured_image && (
              <div className="aspect-video overflow-hidden rounded-lg mb-8">
                <img
                  src={post.featured_image}
                  alt={post.title_ar}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: post.content_ar }}
            />

            {/* Tags */}
            {postTags && postTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {postTags.map((tag: any) => (
                  <Link key={tag.id} to={`/blog?tag=${tag.slug}`}>
                    <Badge variant="outline">#{tag.name_ar}</Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* Share */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                شارك المقال
              </h3>
              <div className="flex gap-2">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title_ar)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(post.title_ar + ' ' + shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {relatedPosts && relatedPosts.length > 0 && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold">مقالات ذات صلة</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedPosts.map((related) => (
                    <Link key={related.id} to={`/blog/${related.slug}`} className="block group">
                      <div className="flex gap-3">
                        {related.featured_image && (
                          <img
                            src={related.featured_image}
                            alt={related.title_ar}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div>
                          <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                            {related.title_ar}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {related.published_at && format(new Date(related.published_at), 'd MMM yyyy', { locale: ar })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
