'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated, logout } = useAuthStore();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      import('@/lib/api/authApi').then(({ authApi }) => authApi.logout().catch(() => {}));
      router.replace('/login');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  if (!_hasHydrated) return null;
  if (!isAuthenticated) return null;

  return (
    <ThemeProvider>
      <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        {/* Sidebar */}
        <DashboardSidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Top bar */}
          <DashboardTopbar onMobileMenuToggle={() => setMobileOpen(true)} />

          {/* Page content */}
          <main
            className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto"
            id="main-content"
            aria-label="Main dashboard content"
          >
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
