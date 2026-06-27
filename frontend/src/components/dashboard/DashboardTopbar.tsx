'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Search, Bell, ChevronDown, User, CalendarCheck,
  Heart, Settings, LogOut, LayoutDashboard, Car, X, Menu, CalendarDays
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/lib/store/themeStore';
import { useAuthStore } from '@/lib/store/authStore';
import { bookingApi } from '@/lib/api/bookingApi';

interface DashboardTopbarProps {
  onMobileMenuToggle?: () => void;
}

export function DashboardTopbar({ onMobileMenuToggle }: DashboardTopbarProps) {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [upcomingCount, setUpcomingCount] = useState<number | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Fetch upcoming bookings count for greeting section
  useEffect(() => {
    if (user) {
      bookingApi.getMyBookings({ limit: 50 })
        .then(data => {
          const upcoming = data.bookings.filter((b: any) => ['pending', 'confirmed', 'active'].includes(b.status));
          setUpcomingCount(upcoming.length);
        })
        .catch(() => setUpcomingCount(0));
    }
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    import('@/lib/api/authApi').then(({ authApi }) => authApi.logout().catch(() => {}));
    logout();
    router.push('/login');
  };

  const initials = `${user?.firstName?.[0] ?? ''}`.toUpperCase();

  const PROFILE_ITEMS = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
    { href: '/dashboard/bookings', icon: CalendarCheck, label: 'My Bookings' },
    { href: '/cars', icon: Car, label: 'Browse Cars' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <header
      className="sticky top-0 z-40 flex h-20 items-center justify-between gap-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 px-4 sm:px-6 lg:px-8"
      role="banner"
    >
      {/* Welcome Greeting and Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden flex items-center justify-center h-10 w-10 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200/60 dark:border-slate-800"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Greeting Section */}
        <div className="hidden sm:block">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            Welcome back, {user?.firstName || 'Guest'} 👋
          </h2>
          {upcomingCount !== null && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1">
              <CalendarDays className="h-3 w-3 text-blue-500" />
              You have {upcomingCount} upcoming booking{upcomingCount !== 1 ? 's' : ''}.
            </p>
          )}
        </div>
      </div>

      {/* Center/Right controls */}
      <div className="flex items-center gap-3 flex-1 justify-end max-w-2xl">
        {/* Search bar */}
        <div className="flex-1 max-w-xs sm:max-w-sm hidden md:block">
          <div
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 transition-all duration-200 ${
              searchFocused
                ? 'border-blue-500 dark:border-blue-400 bg-white dark:bg-slate-900 shadow-sm shadow-blue-100 dark:shadow-blue-950/30'
                : 'border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900'
            }`}
          >
            <Search className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              type="search"
              placeholder="Search..."
              className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value;
                  router.push(`/cars?search=${encodeURIComponent(val)}`);
                }
              }}
              aria-label="Search dashboard"
              id="dashboard-search"
            />
            {searchFocused && (
              <kbd className="inline-flex h-5 items-center rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                ESC
              </kbd>
            )}
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 border border-slate-200/60 dark:border-slate-800"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 30, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4 w-4" />}
            </motion.div>
          </AnimatePresence>
        </button>

        {/* Notification bell */}
        <Link
          href="#notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 border border-slate-200/60 dark:border-slate-800"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950 animate-pulse" aria-label="Unread notifications" />
        </Link>

        {/* Divider */}
        <span className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-2 transition-all duration-200 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-xs shrink-0 shadow-sm">
              {initials || <User className="h-4 w-4" />}
            </div>
            <span className="hidden sm:block text-sm font-semibold text-slate-800 dark:text-white max-w-[100px] truncate">
              {user?.firstName}
            </span>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-58 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 overflow-hidden z-50"
                role="menu"
                aria-label="Profile menu"
              >
                {/* User info header */}
                <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.firstName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{user?.email}</p>
                  <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {user?.role}
                  </span>
                </div>

                {/* Nav items */}
                <div className="py-1.5">
                  {PROFILE_ITEMS.map(({ href, icon: Icon, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                      role="menuitem"
                    >
                      <Icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      {label}
                    </Link>
                  ))}
                </div>

                {/* Logout */}
                <div className="border-t border-slate-100 dark:border-slate-800 py-1.5 bg-slate-50/20 dark:bg-slate-900/20">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
