import dynamic from 'next/dynamic';
import { ProtectedRoute } from '@/components/ProtectedRoute';
const MigrateImages = dynamic(() => import('@/views/admin/MigrateImages'), { ssr: false });
export default function MigrateImagesPage() { return <ProtectedRoute><MigrateImages /></ProtectedRoute>; }
