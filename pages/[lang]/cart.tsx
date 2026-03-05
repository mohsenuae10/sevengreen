/**
 * Cart page — client-side only (no SSR needed, uses localStorage)
 */
import type { GetStaticPaths, GetStaticProps } from 'next';
import PublicLayout from '@/components/PublicLayout';
import Cart from '@/views/Cart';

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [{ params: { lang: 'ar' } }, { params: { lang: 'en' } }],
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const lang = (params?.lang as string) || 'ar';
  if (!['ar', 'en'].includes(lang)) return { notFound: true };
  return { props: { lang } };
};

export default function CartPage() {
  return <PublicLayout><Cart /></PublicLayout>;
}
