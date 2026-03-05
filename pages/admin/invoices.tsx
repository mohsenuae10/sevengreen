import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const Invoices = dynamic(() => import('@/views/admin/Invoices'), { ssr: false });
export default function AdminInvoicesPage() { return <ProtectedRoute><Invoices /></ProtectedRoute>; }
