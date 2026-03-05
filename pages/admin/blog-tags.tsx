import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const BlogTags = dynamic(() => import('@/views/admin/BlogTags'), { ssr: false });
export default function AdminBlogTagsPage() { return <ProtectedRoute><BlogTags /></ProtectedRoute>; }
