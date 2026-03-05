/**
 * Category landing page — ISR with fallback: 'blocking'
 */
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { supabaseServer } from '@/lib/supabase-server';
import PublicLayout from '@/components/PublicLayout';
import CategoryLanding from '@/views/CategoryLanding';

const db: any = supabaseServer;

export const getStaticPaths: GetStaticPaths = async () => {
  const { data: categories } = await db
    .from('categories')
    .select('slug')
    .eq('is_active', true);

  const paths: { params: { lang: string; slug: string } }[] = [];
  for (const cat of categories || []) {
    paths.push({ params: { lang: 'ar', slug: cat.slug } });
    paths.push({ params: { lang: 'en', slug: cat.slug } });
  }

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const lang = (params?.lang as string) || 'ar';
  const slug = params?.slug as string;
  if (!['ar', 'en'].includes(lang) || !slug) return { notFound: true };

  const queryClient = new QueryClient();

  // Prefetch products in this category
  await queryClient.prefetchQuery({
    queryKey: ['category-products', slug],
    queryFn: async () => {
      const { data } = await db
        .from('products')
        .select('*')
        .eq('category', slug)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  // Prefetch categories
  await queryClient.prefetchQuery({
    queryKey: ['active-categories'],
    queryFn: async () => {
      const { data } = await db
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
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

export default function CategoryPage({ lang }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <PublicLayout>
      <CategoryLanding />
    </PublicLayout>
  );
}
