/**
 * Root index → redirect to /ar (default language)
 */
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: { destination: '/ar', permanent: true },
  };
};

export default function RootIndex() {
  return null;
}
