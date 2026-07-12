'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCheck, Trash2, Calendar, CreditCard,
  Shield, Tag, AlertTriangle, Info, CheckCircle2, X, Filter
} from 'lucide-react';
import { useNotificationStore } from '@/lib/store/notificationStore';
import type { AppNotification, NotifType } from '@/lib/store/notificationStore';
import { useState } from 'react';

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<NotifType, {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
}> = {
  booking:  { icon: Calendar,      iconBg: 'bg-blue-100 dark:bg-blue-950/50',    iconColor: 'text-blue-600 dark:text-blue-400',    label: 'Booking' },
  payment:  { icon: CreditCard,    iconBg: 'bg-emerald-100 dark:bg-emerald-950/50', iconColor: 'text-emerald-600 dark:text-emerald-400', label: 'Payment' },
  system:   { icon: Shield,        iconBg: 'bg-slate-100 dark:bg-slate-800',     iconColor: 'text-slate-600 dark:text-slate-300',  label: 'System' },
  promo:    { icon: Tag,           iconBg: 'bg-violet-100 dark:bg-violet-950/50', iconColor: 'text-violet-600 dark:text-violet-400', label: 'Promo' },
  offer:    { icon: Tag,           iconBg: 'bg-amber-100 dark:bg-amber-950/50',  iconColor: 'text-amber-600 dark:text-amber-400',  label: 'Offer' },
  alert:    { icon: AlertTriangle, iconBg: 'bg-amber-100 dark:bg-amber-950/50',  iconColor: 'text-amber-600 dark:text-amber-400',  label: 'Alert' },
  reminder: { icon: Bell,          iconBg: 'bg-violet-100 dark:bg-violet-950/50', iconColor: 'text-violet-600 dark:text-violet-400', label: 'Reminder' },
};

const FILTER_OPTIONS = [
  { key: 'all',     label: 'All' },
  { key: 'unread',  label: 'Unread' },
  { key: 'booking', label: 'Bookings' },
  { key: 'payment', label: 'Payments' },
  { key: 'promo',   label: 'Promos' },
  { key: 'system',  label: 'System' },
];

// ─── Single Notification Row ──────────────────────────────────────────────────

function NotifCard({
  notif,
  onRead,
  onDelete,
}: {
  notif: AppNotification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.system;
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      className={`group relative flex gap-4 p-5 rounded-2xl border transition-all duration-200 ${
        notif.read
          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          : 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60 shadow-sm shadow-blue-100 dark:shadow-blue-950/30'
      }`}
    >
      {/* Unread dot */}
      {!notif.read && (
        <span className="absolute top-5 right-5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-950" />
      )}

      {/* Icon */}
      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${cfg.iconBg}`}>
        <Icon className={`h-5 w-5 ${cfg.iconColor}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h3 className={`text-sm font-bold truncate ${notif.read ? 'text-slate-700 dark:text-slate-200' : 'text-slate-900 dark:text-white'}`}>
                {notif.title}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${cfg.iconBg} ${cfg.iconColor}`}>
                {cfg.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1 pr-4">
              {notif.message}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{notif.time}</p>
          </div>
        </div>

        {/* Action link */}
        {notif.actionLabel && notif.actionHref && (
          <a
            href={notif.actionHref}
            className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {notif.actionLabel} →
          </a>
        )}
      </div>

      {/* Hover actions */}
      <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
        {!notif.read && (
          <button
            onClick={() => onRead(notif.id)}
            title="Mark as read"
            className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800/60 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={() => onDelete(notif.id)}
          title="Delete notification"
          className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  // All state now lives in the persistent Zustand store — survives page refreshes
  const { notifications, markRead, markAllRead, dismiss, clearAll } = useNotificationStore();
  const [activeFilter, setActiveFilter] = useState('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.read;
    return n.type === activeFilter;
  });

  const handleClearAll = () => {
    if (window.confirm('Clear all notifications? This cannot be undone.')) {
      clearAll();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl pb-16">

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 shadow-xl shadow-violet-200 dark:shadow-violet-950/50">
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -left-8 w-48 h-48 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Bell className="h-4 w-4 text-white" />
              </div>
              <span className="text-violet-200 text-sm font-medium">Activity Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Notifications</h1>
            <p className="mt-2 text-violet-200 text-sm max-w-md">
              Stay up to date with your bookings, payments, and special offers.
            </p>
          </div>

          {/* Stats pill */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-3 text-white">
              <Bell className="h-5 w-5" />
              <div>
                <p className="text-xl font-bold leading-none">{unreadCount}</p>
                <p className="text-xs text-violet-200 mt-0.5">Unread</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-slate-400" />
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setActiveFilter(opt.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                activeFilter === opt.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300'
              }`}
            >
              {opt.label}
              {opt.key === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white text-[9px] font-extrabold">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {notifications.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl border border-blue-200 dark:border-blue-800 transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl border border-red-200 dark:border-red-800 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Notification List */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800"
          >
            <div className="mx-auto mb-5 w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-950/50 dark:to-purple-900/30 flex items-center justify-center">
              <Bell className="h-10 w-10 text-violet-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {activeFilter === 'all' ? 'No notifications' : `No ${activeFilter} notifications`}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto text-sm">
              {activeFilter === 'all'
                ? "You're all caught up! Notifications will appear here."
                : 'Try a different filter to see more notifications.'}
            </p>
          </motion.div>
        ) : (
          <motion.div key="list" className="space-y-3">
            {/* Unread section label */}
            {activeFilter !== 'unread' && filtered.some((n) => !n.read) && (
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">
                Unread
              </p>
            )}
            <AnimatePresence>
              {filtered.filter((n) => !n.read).map((n) => (
                <NotifCard key={n.id} notif={n} onRead={markRead} onDelete={dismiss} />
              ))}
            </AnimatePresence>

            {/* Read section label */}
            {activeFilter !== 'unread' && filtered.some((n) => n.read) && filtered.some((n) => !n.read) && (
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 pt-4 mb-2">
                Earlier
              </p>
            )}
            <AnimatePresence>
              {(activeFilter === 'unread' ? [] : filtered.filter((n) => n.read)).map((n) => (
                <NotifCard key={n.id} notif={n} onRead={markRead} onDelete={dismiss} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info footer */}
      {notifications.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
          <p>Notification states are saved locally and persist across page refreshes.</p>
        </div>
      )}
    </div>
  );
}
