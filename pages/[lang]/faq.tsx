import type { GetStaticPaths, GetStaticProps } from 'next';
import PublicLayout from '@/components/PublicLayout';
import FAQ from '@/views/FAQ';

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [{ params: { lang: 'ar' } }, { params: { lang: 'en' } }],
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const lang = (params?.lang as string) || 'ar';
  if (!['ar', 'en'].includes(lang)) return { notFound: true };
  return { props: { lang }, revalidate: 3600 };
};

export default function FAQPage() {
  return <PublicLayout><FAQ /></PublicLayout>;
}
