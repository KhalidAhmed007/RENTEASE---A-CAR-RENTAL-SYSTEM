'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  /** Where to redirect unauthenticated users (default: /login) */
  redirectTo?: string;
  /** Optionally enforce a specific role */
  requiredRole?: 'admin' | 'user';
}

/**
 * Client-side route guard.
 * Wraps a page/layout to ensure the user is authenticated (and optionally has
 * the required role). Complements the server-side Next.js middleware check.
 */
export function AuthGuard({
  children,
  redirectTo = '/login',
  requiredRole,
}: AuthGuardProps) {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!_hasHydrated) return;
    
    if (!isAuthenticated) {
      const target = `${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`;
      router.replace(target);
      return;
    }
    if (requiredRole && user?.role !== requiredRole) {
      // Authenticated but wrong role – send to general dashboard
      router.replace('/dashboard');
    }
  }, [_hasHydrated, isAuthenticated, user, router, redirectTo, requiredRole, pathname]);

  // Don't render children until auth is confirmed
  if (!_hasHydrated) return null;
  if (!isAuthenticated) return null;
  if (requiredRole && user?.role !== requiredRole) return null;

  return <>{children}</>;
}
