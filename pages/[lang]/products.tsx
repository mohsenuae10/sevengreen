/**
 * Products listing page — ISR with revalidate: 60
 */
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { supabaseServer } from '@/lib/supabase-server';
import PublicLayout from '@/components/PublicLayout';
import Products from '@/views/Products';

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

  // Prefetch products with ratings
  await queryClient.prefetchQuery({
    queryKey: ['products-with-ratings'],
    queryFn: async () => {
      const { data } = await db.from('products').select('*').eq('is_active', true);
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

export default function ProductsPage({ lang }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <PublicLayout>
      <Products />
    </PublicLayout>
  );
}
