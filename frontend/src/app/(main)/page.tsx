'use client';

import Link from 'next/link';
import { Car, ArrowRight, LayoutDashboard, CalendarCheck } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';

export default function HomePage() {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_0%,_#3b82f6_0%,_transparent_70%)]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-8">
            <Car className="h-4 w-4" /> Premium Fleet Available Now
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Drive Your <span className="text-blue-400">Perfect</span> Car Today
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            Browse hundreds of premium vehicles. Transparent pricing, instant booking, zero hassle.
          </p>

          {/* Personalised greeting for logged-in users */}
          {_hasHydrated && isAuthenticated && (
            <p className="text-sm text-slate-400 mb-6">
              Welcome back,{' '}
              <span className="text-blue-400 font-semibold">{user?.firstName}</span>! 👋
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cars"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors text-base"
            >
              Browse Cars <ArrowRight className="h-5 w-5" />
            </Link>

            {/*
              Only render the second CTA after Zustand has hydrated from localStorage.
              Before hydration (_hasHydrated=false) we show a ghost button so layout
              doesn't shift. After hydration we show the correct action.
            */}
            {!_hasHydrated ? (
              // Ghost placeholder — prevents layout shift during hydration
              <span className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-slate-700 text-transparent font-semibold text-base select-none" aria-hidden>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            ) : isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-slate-600 hover:bg-slate-800 text-white font-semibold transition-colors text-base"
              >
                <LayoutDashboard className="h-5 w-5" />
                My Dashboard
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-slate-600 hover:bg-slate-800 text-white font-semibold transition-colors text-base"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { stat: '500+', label: 'Vehicles' },
            { stat: '10,000+', label: 'Happy Customers' },
            { stat: '50+', label: 'Locations' },
            { stat: '4.9★', label: 'Average Rating' },
          ].map(({ stat, label }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{stat}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Ready to Hit the Road?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Join thousands of satisfied customers. Booking takes less than 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
            >
              View All Cars <ArrowRight className="h-5 w-5" />
            </Link>
            {_hasHydrated && isAuthenticated && (
              <Link
                href="/dashboard/bookings"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors"
              >
                <CalendarCheck className="h-5 w-5" />
                My Bookings
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
