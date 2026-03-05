/**
 * Checkout page — client-side only
 */
import type { GetStaticPaths, GetStaticProps } from 'next';
import dynamic from 'next/dynamic';
import PublicLayout from '@/components/PublicLayout';

const Checkout = dynamic(() => import('@/views/Checkout'), { ssr: false });

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [{ params: { lang: 'ar' } }, { params: { lang: 'en' } }],
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const lang = (params?.lang as string) || 'ar';
  if (!['ar', 'en'].includes(lang)) return { notFound: true };
  return { props: { lang } };
};

export default function CheckoutPage() {
  return <PublicLayout><Checkout /></PublicLayout>;
}
