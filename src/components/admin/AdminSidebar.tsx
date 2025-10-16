import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Clock, CreditCard, Truck, Download } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';

const navItems = [
  { title: 'لوحة التحكم', url: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'المنتجات', url: '/admin/products', icon: Package },
  { title: 'استيراد منتج', url: '/admin/import-product', icon: Download },
  { title: 'جميع الطلبات', url: '/admin/orders', icon: ShoppingCart },
  { title: 'قيد انتظار الدفع', url: '/admin/orders/pending-payment', icon: Clock },
  { title: 'الطلبات المدفوعة', url: '/admin/orders/paid', icon: CreditCard },
  { title: 'الطلبات المشحونة', url: '/admin/orders/shipped', icon: Truck },
  { title: 'الإعدادات', url: '/admin/settings', icon: Settings },
];

export const AdminSidebar = () => {
  const { signOut } = useAdminAuth();

  return (
    <aside className="w-64 min-h-screen bg-card border-l border-border">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">Seven Green</h1>
        <p className="text-sm text-muted-foreground">لوحة التحكم</p>
      </div>
      
      <nav className="px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent text-foreground'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          <span>تسجيل الخروج</span>
        </Button>
      </div>
    </aside>
  );
};
