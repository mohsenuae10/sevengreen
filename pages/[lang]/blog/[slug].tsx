/**
 * Blog post detail page — ISR with fallback: 'blocking'
 * New posts are generated on first visit, then cached.
 */
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { supabaseServer } from '@/lib/supabase-server';
import PublicLayout from '@/components/PublicLayout';
import BlogPost from '@/views/BlogPost';

const db: any = supabaseServer;

export const getStaticPaths: GetStaticPaths = async () => {
  const { data: posts } = await db
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published');

  const paths: { params: { lang: string; slug: string } }[] = [];
  for (const p of posts || []) {
    paths.push({ params: { lang: 'ar', slug: p.slug } });
    paths.push({ params: { lang: 'en', slug: p.slug } });
  }

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const lang = (params?.lang as string) || 'ar';
  const slug = params?.slug as string;
  if (!['ar', 'en'].includes(lang) || !slug) return { notFound: true };

  const queryClient = new QueryClient();

  // Prefetch blog post
  await queryClient.prefetchQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data } = await db
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      return data;
    },
  });

  const post = queryClient.getQueryData(['blog-post', slug]);
  if (!post) return { notFound: true };

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      lang,
    },
    revalidate: 60,
  };
};

export default function BlogPostPage({ lang }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <PublicLayout>
      <BlogPost />
    </PublicLayout>
  );
}
