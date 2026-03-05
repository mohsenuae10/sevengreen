/**
 * Invoice view page — client-side only (no SEO needed)
 */
import dynamic from 'next/dynamic';

const ViewInvoice = dynamic(() => import('@/views/ViewInvoice'), { ssr: false });

export default function InvoicePage() {
  return <ViewInvoice />;
}
