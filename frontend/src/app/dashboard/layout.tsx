'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardTopbar } from '@/components/dashboard/DashboardTopbar';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Loader2 } from 'lucide-react';

// ─── Redirect screen shown while router.replace('/login') is in-flight ─────────
function RedirectingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-sm font-medium text-slate-500">Redirecting to login…</p>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // If the store has hydrated and the user is not authenticated (e.g. direct
    // URL access to /dashboard while logged out, or session expired), redirect
    // to login. We do NOT call this when already mid-redirect (initiated by the
    // topbar logout button) to prevent competing router.replace/push calls.
    if (_hasHydrated && !isAuthenticated && !redirecting) {
      setRedirecting(true);
      router.replace('/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated, isAuthenticated]);

  // Still hydrating from localStorage — show spinner, never a blank white page
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Hydrated but not authenticated (e.g. just logged out) — show redirect screen
  // until Next.js completes the navigation to /login
  if (!isAuthenticated || redirecting) {
    return <RedirectingScreen />;
  }

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
