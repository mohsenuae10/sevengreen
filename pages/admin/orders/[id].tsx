import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const OrderDetail = dynamic(() => import('@/views/admin/OrderDetail'), { ssr: false });
export default function AdminOrderDetailPage() { return <ProtectedRoute><OrderDetail /></ProtectedRoute>; }
