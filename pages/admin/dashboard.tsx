import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const Dashboard = dynamic(() => import('@/views/admin/Dashboard'), { ssr: false });
export default function AdminDashboardPage() { return <ProtectedRoute><Dashboard /></ProtectedRoute>; }
