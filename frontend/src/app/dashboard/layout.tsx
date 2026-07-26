'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const redirecting = useRef(false);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated && !redirecting.current) {
      redirecting.current = true;
      window.location.replace('/login');
    }
  }, [_hasHydrated, isAuthenticated]);

  // Still hydrating — show spinner
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Not authenticated — show nothing while hard redirect fires
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Redirecting to login…</p>
      </div>
    );
  }

  return (
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
  );
}
