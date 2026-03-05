/**
 * Order success page — client-side only
 */
import type { GetStaticPaths, GetStaticProps } from 'next';
import dynamic from 'next/dynamic';
import PublicLayout from '@/components/PublicLayout';

const OrderSuccess = dynamic(() => import('@/views/OrderSuccess'), { ssr: false });

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const lang = (params?.lang as string) || 'ar';
  if (!['ar', 'en'].includes(lang)) return { notFound: true };
  return { props: { lang } };
};

export default function OrderSuccessPage() {
  return <PublicLayout><OrderSuccess /></PublicLayout>;
}
