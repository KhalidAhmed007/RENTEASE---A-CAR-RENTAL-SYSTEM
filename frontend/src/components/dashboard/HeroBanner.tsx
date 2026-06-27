'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Car, CalendarCheck, ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { AuthUser } from '@/lib/store/authStore';

interface HeroBannerProps {
  user: AuthUser;
  availableCarsCount: number;
  activeBookingsCount: number;
  recommendedCount: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const TRAVEL_MESSAGES = [
  'Your next adventure is just a booking away. 🌍',
  'Life is short — drive something extraordinary. 🚀',
  'Explore the world, one rental at a time. 🗺️',
  'Where will you go today? Premium cars await. ✨',
];

export function HeroBanner({
  user,
  availableCarsCount,
  activeBookingsCount,
  recommendedCount,
}: HeroBannerProps) {
  const greeting = getGreeting();
  const message = useMemo(
    () => TRAVEL_MESSAGES[Math.floor(Math.random() * TRAVEL_MESSAGES.length)],
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700 dark:from-indigo-800 dark:via-blue-800 dark:to-violet-900 p-8 sm:p-10 shadow-xl"
      aria-label="Welcome hero banner"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-violet-500/20 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3 max-w-xl">
          <motion.p
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {greeting}, {user.firstName}!
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22, duration: 0.45 }}
            className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight"
          >
            Ready for your next ride?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.32, duration: 0.4 }}
            className="text-white/80 text-base"
          >
            {message}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.4 }}
            className="flex flex-wrap gap-3 pt-1"
          >
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 shadow-md hover:bg-blue-50 transition-all duration-200 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Browse available cars"
            >
              <Car className="h-4 w-4" />
              Browse Cars
            </Link>
            <Link
              href="/dashboard/bookings"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/25 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="View my bookings"
            >
              <CalendarCheck className="h-4 w-4" />
              My Bookings
            </Link>
            <Link
              href="#offers"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/25 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="View special offers"
            >
              <MapPin className="h-4 w-4" />
              View Offers
            </Link>
          </motion.div>
        </div>

        {/* Stats pills */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex sm:flex-col gap-3 shrink-0"
        >
          {[
            { label: 'Cars Available', value: availableCarsCount, icon: Car },
            { label: 'Active Bookings', value: activeBookingsCount, icon: CalendarCheck },
            { label: 'Recommendations', value: recommendedCount, icon: Sparkles },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-2xl bg-white/15 backdrop-blur-sm px-4 py-3 border border-white/20"
            >
              <div className="rounded-xl bg-white/20 p-2">
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-white leading-none">{value}</p>
                <p className="text-[11px] text-white/70 mt-0.5 leading-none">{label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Arrow hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="relative z-10 mt-6 flex items-center gap-1.5 text-white/50 text-xs"
      >
        <ArrowRight className="h-3.5 w-3.5 animate-bounce-x" />
        Scroll to see your dashboard
      </motion.div>
    </motion.div>
  );
}
