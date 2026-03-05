import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const BlogPostEditor = dynamic(() => import('@/views/admin/BlogPostEditor'), { ssr: false });
export default function AdminBlogEditPage() { return <ProtectedRoute><BlogPostEditor /></ProtectedRoute>; }
