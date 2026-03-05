import { useState } from 'react';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider, HydrationBoundary } from '@tanstack/react-query';
import { CartProvider } from '@/contexts/CartContext';
import { AdminAuthProviderNext } from '@/contexts/AdminAuthContext';
import { LanguageCurrencyProviderNext } from '@/contexts/LanguageCurrencyContext';
import { Toaster } from '@/components/ui/toaster';
import '@/i18n';
import '@/index.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={pageProps.dehydratedState}>
        <AdminAuthProviderNext>
          <CartProvider>
            <LanguageCurrencyProviderNext>
              <Component {...pageProps} />
              <Toaster />
            </LanguageCurrencyProviderNext>
          </CartProvider>
        </AdminAuthProviderNext>
      </HydrationBoundary>
    </QueryClientProvider>
  );
}
