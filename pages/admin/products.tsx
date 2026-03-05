import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const Products = dynamic(() => import('@/views/admin/Products'), { ssr: false });
export default function AdminProductsPage() { return <ProtectedRoute><Products /></ProtectedRoute>; }
