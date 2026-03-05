import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const ImportProduct = dynamic(() => import('@/views/admin/ImportProduct'), { ssr: false });
export default function AdminImportPage() { return <ProtectedRoute><ImportProduct /></ProtectedRoute>; }
