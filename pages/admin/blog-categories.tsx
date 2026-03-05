import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const BlogCategories = dynamic(() => import('@/views/admin/BlogCategories'), { ssr: false });
export default function AdminBlogCategoriesPage() { return <ProtectedRoute><BlogCategories /></ProtectedRoute>; }
