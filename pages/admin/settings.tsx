import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const Settings = dynamic(() => import('@/views/admin/Settings'), { ssr: false });
export default function AdminSettingsPage() { return <ProtectedRoute><Settings /></ProtectedRoute>; }
