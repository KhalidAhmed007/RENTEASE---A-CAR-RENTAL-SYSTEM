'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import {
  LayoutDashboard, Car, CalendarClock, CreditCard, LogOut,
  Settings, X, BarChart3, ChevronRight, Heart, Bell, User
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Premium Menu List
const USER_NAV = [
  { href: '/dashboard',               label: 'Overview',       icon: LayoutDashboard, exact: true },
  { href: '/dashboard/bookings',      label: 'My Bookings',    icon: CalendarClock },
  { href: '/dashboard/payments',      label: 'Payments',       icon: CreditCard },
  { href: '/dashboard/wishlist',      label: 'Wishlist',       icon: Heart },
  { href: '/dashboard/notifications', label: 'Notifications',  icon: Bell },
  { href: '/dashboard/settings',      label: 'Settings',       icon: Settings },
];

interface DashboardSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function NavItem({
  href,
  label,
  icon: Icon,
  exact,
  onClick,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href) && href !== '#';

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'group flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border border-transparent',
        active
          ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/30'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white hover:translate-x-1'
      )}
      aria-current={active ? 'page' : undefined}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
        {label}
      </div>
      <ChevronRight className={cn('h-4 w-4 transition-all duration-200', active ? 'opacity-90 translate-x-0.5' : 'opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0')} />
    </Link>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    import('@/lib/api/authApi').then(({ authApi }) => authApi.logout().catch(() => {}));
    logout();
    router.push('/login');
  };

  const initials = `${user?.firstName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/80">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/60 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200 dark:shadow-blue-900/20">
            <Car className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">RentEase</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Profile Card Summary */}
      <div className="px-4 py-4 border-b border-slate-200/60 dark:border-slate-800/80">
        <Link href="/dashboard/settings" onClick={onClose}>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-800/80 shadow-sm transition-all duration-200 hover:shadow">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-sm shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.firstName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role} Account</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto" aria-label="Dashboard navigation">
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-3">
          Main Menu
        </p>
        {USER_NAV.map(({ href, label, icon, exact }) => (
          <NavItem key={href} href={href} label={label} icon={icon} exact={exact} onClick={onClose} />
        ))}

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <>
            <div className="pt-6 pb-2">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3">
                Admin
              </p>
            </div>
            <Link
              href="/dashboard/admin"
              onClick={onClose}
              className={cn(
                'flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 border border-transparent',
                pathname.startsWith('/dashboard/admin')
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30'
                  : 'text-violet-700 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:translate-x-1'
              )}
              aria-current={pathname.startsWith('/dashboard/admin') ? 'page' : undefined}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="h-4.5 w-4.5 shrink-0" />
                Admin Panel
              </div>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400">
                ADMIN
              </span>
            </Link>
          </>
        )}
      </nav>

      {/* Sidebar Footer */}
      <div className="px-4 py-4 border-t border-slate-200/60 dark:border-slate-800/80 space-y-1 bg-slate-50/30 dark:bg-slate-950/20">
        <Link
          href="/cars"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <Car className="h-4 w-4" />
          Browse Cars
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          aria-label="Log out"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

export function DashboardSidebar({ mobileOpen, onMobileClose }: DashboardSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-950 border-r border-slate-200/60 dark:border-slate-800 sticky top-0 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={onMobileClose}
              aria-hidden="true"
            />
            {/* Drawer */}
            <motion.aside
              key="sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 z-50 h-full w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 md:hidden overflow-y-auto"
              aria-label="Mobile navigation"
            >
              <SidebarContent onClose={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
