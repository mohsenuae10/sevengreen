import type { GetStaticPaths, GetStaticProps } from 'next';
import PublicLayout from '@/components/PublicLayout';
import ReturnPolicy from '@/views/ReturnPolicy';

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [{ params: { lang: 'ar' } }, { params: { lang: 'en' } }],
  fallback: false,
});

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const lang = (params?.lang as string) || 'ar';
  if (!['ar', 'en'].includes(lang)) return { notFound: true };
  return { props: { lang }, revalidate: 3600 };
};

export default function ReturnPolicyPage() {
  return <PublicLayout><ReturnPolicy /></PublicLayout>;
}
