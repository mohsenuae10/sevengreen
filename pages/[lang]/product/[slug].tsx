/**
 * Product detail page — ISR with getStaticPaths fallback: 'blocking'
 * New products are generated on first visit, then cached.
 * revalidate: 60 keeps prices/stock fresh.
 */
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import { supabaseServer } from '@/lib/supabase-server';
import PublicLayout from '@/components/PublicLayout';
import ProductDetail from '@/views/ProductDetail';

// Cast to any to avoid "Type instantiation is excessively deep" with generated Supabase types
const db: any = supabaseServer;

export const getStaticPaths: GetStaticPaths = async () => {
  // Pre-generate paths for all active products × 2 languages
  const { data: products } = await db
    .from('products')
    .select('slug, id')
    .eq('is_active', true);

  const paths: { params: { lang: string; slug: string } }[] = [];
  for (const p of products || []) {
    const identifier = p.slug || p.id;
    paths.push({ params: { lang: 'ar', slug: identifier } });
    paths.push({ params: { lang: 'en', slug: identifier } });
  }

  return {
    paths,
    fallback: 'blocking', // New products SSR'd on first visit, then cached
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const lang = (params?.lang as string) || 'ar';
  const slug = params?.slug as string;
  if (!['ar', 'en'].includes(lang) || !slug) return { notFound: true };

  const queryClient = new QueryClient();

  // Determine if slug is UUID or text slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  // Prefetch product with images, reviews, and ratingStats combined
  // This must match the data structure returned by the component's useQuery queryFn
  await queryClient.prefetchQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      let query = db.from('products').select('*');
      if (isUUID) {
        query = query.eq('id', slug);
      } else {
        query = query.eq('slug', slug);
      }
      const { data: productData } = await query.maybeSingle();
      if (!productData) return null;

      const { data: images } = await db
        .from('product_images')
        .select('*')
        .eq('product_id', productData.id)
        .order('display_order');

      const { data: reviews } = await db
        .from('product_reviews')
        .select('*')
        .eq('product_id', productData.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      return {
        ...productData,
        images: images || [],
        reviews: reviews || [],
        ratingStats: null,
      };
    },
  });

  // Check if product was found
  const product = queryClient.getQueryData(['product', slug]);
  if (!product) return { notFound: true };

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      lang,
    },
    revalidate: 60, // Refresh price/stock every 60s
  };
};

export default function ProductPage({ lang }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <PublicLayout>
      <ProductDetail />
    </PublicLayout>
  );
}
