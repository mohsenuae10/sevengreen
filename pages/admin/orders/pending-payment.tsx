import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const Orders = dynamic(() => import('@/views/admin/Orders'), { ssr: false });
export default function PendingPage() { return <ProtectedRoute><Orders /></ProtectedRoute>; }
