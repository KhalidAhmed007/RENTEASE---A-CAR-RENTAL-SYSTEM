'use client';

import { Car } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api/axios';

const STATS = [
  { stat: '500+', label: 'Vehicles' },
  { stat: '4.9★', label: 'Rating' },
  { stat: '10k+', label: 'Customers' },
  { stat: '24/7', label: 'Support' },
] as const;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated, setAccessToken, logout } = useAuthStore();
  const router = useRouter();
  // null = still validating, true = valid session, false = no valid session
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      // Definitely not authenticated — show the login form immediately
      setSessionValid(false);
      return;
    }

    // isAuthenticated is true in localStorage, but the cookie may be missing/expired.
    // Validate by attempting a silent token refresh before redirecting anywhere.
    api.post('/auth/refresh-token')
      .then((res) => {
        const newToken = res.data?.data?.accessToken;
        if (newToken) setAccessToken(newToken);
        setSessionValid(true);
        router.replace('/dashboard');
      })
      .catch(() => {
        // Cookie is gone / expired — clear stale Zustand state, show the form
        logout();
        setSessionValid(false);
      });
  }, [_hasHydrated, isAuthenticated, router, setAccessToken, logout]);

  // Spinner while hydrating or while the refresh check is in flight
  if (!_hasHydrated || sessionValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Session valid — redirect to dashboard is in flight, render nothing
  if (sessionValid === true) return null;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      {/* ── Left: Branding panel ───────────────────────────────── */}
      <aside
        aria-hidden="true"
        className="hidden lg:flex flex-col bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-12 justify-between relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_10%_90%,_#3b82f6_0%,_transparent_55%)]" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_90%_10%,_#6366f1_0%,_transparent_50%)]" />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-2.5 font-bold text-xl">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-900/40">
            <Car className="h-5 w-5 text-white" />
          </div>
          RentEase
        </Link>

        {/* Hero copy */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
              Your Journey<br />Starts Here
            </h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-xs">
              Access hundreds of premium vehicles with transparent pricing and
              instant booking — no hidden fees, ever.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {STATS.map(({ stat, label }) => (
              <div key={label} className="rounded-xl bg-white/[0.08] border border-white/10 p-4 backdrop-blur-sm">
                <p className="text-2xl font-bold text-blue-300">{stat}</p>
                <p className="mt-0.5 text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <blockquote className="border-l-2 border-blue-500 pl-4">
            <p className="text-sm text-slate-400 italic">
              &ldquo;Booked in under 3 minutes. The car was perfect.&rdquo;
            </p>
            <footer className="mt-1 text-xs text-slate-500">— Sarah K., verified customer</footer>
          </blockquote>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-slate-600">
          © {new Date().getFullYear()} RentEase · All rights reserved
        </p>
      </aside>

      {/* ── Right: Form area ──────────────────────────────────── */}
      <main className="flex flex-col justify-center px-6 py-12 sm:px-12 bg-slate-50 dark:bg-slate-900">

        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Car className="h-4 w-4 text-white" />
            </div>
            RentEase
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
