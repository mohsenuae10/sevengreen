import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const PendingPaymentOrders = dynamic(() => import('@/views/admin/PendingPaymentOrders'), { ssr: false });
export default function PendingPage() { return <ProtectedRoute><PendingPaymentOrders /></ProtectedRoute>; }
