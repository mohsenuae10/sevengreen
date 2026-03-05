import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const Banners = dynamic(() => import('@/views/admin/PromotionalBanners'), { ssr: false });
export default function AdminBannersPage() { return <ProtectedRoute><Banners /></ProtectedRoute>; }
