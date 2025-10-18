import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Clock, CreditCard, Truck, Download } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';

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
  const { open } = useSidebar();
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === '/admin/orders') {
      return location.pathname === '/admin/orders' || location.pathname.startsWith('/admin/orders/');
    }
    return location.pathname === url;
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-6">
          {open && (
            <>
              <h1 className="text-2xl font-bold text-primary">Seven Green</h1>
              <p className="text-sm text-muted-foreground">لوحة التحكم</p>
            </>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <LogOut className="h-5 w-5" />
              <span>تسجيل الخروج</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
