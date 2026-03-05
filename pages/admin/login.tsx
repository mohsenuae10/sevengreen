import dynamic from 'next/dynamic';
const AdminLogin = dynamic(() => import('@/views/admin/Login'), { ssr: false });
export default function AdminLoginPage() { return <AdminLogin />; }
