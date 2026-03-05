/**
 * Home page — ISR with revalidate: 60
 * Pre-fetches products, categories, and banners from Supabase at build time.
 */
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { supabaseServer } from '@/lib/supabase-server';
import PublicLayout from '@/components/PublicLayout';
import Home from '@/views/Home';

// Cast to any to avoid "Type instantiation is excessively deep" with generated Supabase types
const db: any = supabaseServer;

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { lang: 'ar' } }, { params: { lang: 'en' } }],
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const lang = (params?.lang as string) || 'ar';
  if (!['ar', 'en'].includes(lang)) {
    return { notFound: true };
  }

  const queryClient = new QueryClient();

  // Prefetch products
  await queryClient.prefetchQuery({
    queryKey: ['all-products'],
    queryFn: async () => {
      const { data } = await db
        .from('products')
        .select('*')
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

  // Prefetch promotional banners
  await queryClient.prefetchQuery({
    queryKey: ['promotional-banners-active'],
    queryFn: async () => {
      const { data } = await db
        .from('promotional_banners')
        .select('id, banner_image_url, offer_description, product_id')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      return data || [];
    },
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      lang,
    },
    revalidate: 60, // ISR: regenerate every 60 seconds
  };
};

export default function HomePage({ lang }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <PublicLayout>
      <Home />
    </PublicLayout>
  );
}
