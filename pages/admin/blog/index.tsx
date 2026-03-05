import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const BlogPosts = dynamic(() => import('@/views/admin/BlogPosts'), { ssr: false });
export default function AdminBlogPage() { return <ProtectedRoute><BlogPosts /></ProtectedRoute>; }
