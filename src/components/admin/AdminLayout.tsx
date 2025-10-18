import { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background" dir="rtl">
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6 sticky top-0 z-10">
            <SidebarTrigger className="-mr-1" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">لوحة التحكم</h2>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
