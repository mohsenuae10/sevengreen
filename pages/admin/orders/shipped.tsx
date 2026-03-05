import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const ShippedOrders = dynamic(() => import('@/views/admin/ShippedOrders'), { ssr: false });
export default function ShippedPage() { return <ProtectedRoute><ShippedOrders /></ProtectedRoute>; }
