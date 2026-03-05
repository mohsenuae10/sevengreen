import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const PaidOrders = dynamic(() => import('@/views/admin/PaidOrders'), { ssr: false });
export default function PaidPage() { return <ProtectedRoute><PaidOrders /></ProtectedRoute>; }
