/**
 * Blog listing page — ISR with revalidate: 60
 */
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { supabaseServer } from '@/lib/supabase-server';
import PublicLayout from '@/components/PublicLayout';
import Blog from '@/views/Blog';

const db: any = supabaseServer;

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { lang: 'ar' } }, { params: { lang: 'en' } }],
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const lang = (params?.lang as string) || 'ar';
  if (!['ar', 'en'].includes(lang)) return { notFound: true };

  const queryClient = new QueryClient();

  // Prefetch blog posts
  await queryClient.prefetchQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data } = await db
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      return data || [];
    },
  });

  // Prefetch blog categories
  await queryClient.prefetchQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data } = await db.from('blog_categories').select('*').order('name');
      return data || [];
    },
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      lang,
    },
    revalidate: 60,
  };
};

export default function BlogPage({ lang }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <PublicLayout>
      <Blog />
    </PublicLayout>
  );
}
