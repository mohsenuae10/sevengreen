import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const Categories = dynamic(() => import('@/views/admin/Categories'), { ssr: false });
export default function AdminCategoriesPage() { return <ProtectedRoute><Categories /></ProtectedRoute>; }
