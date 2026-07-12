'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, X, Tag, CalendarCheck, CreditCard, Clock, BellOff } from 'lucide-react';
import { useNotificationStore } from '@/lib/store/notificationStore';
import type { AppNotification } from '@/lib/store/notificationStore';

const TYPE_CONFIG: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  booking:  { icon: CalendarCheck, bg: 'bg-blue-100 dark:bg-blue-900/40',    color: 'text-blue-600 dark:text-blue-400' },
  payment:  { icon: CreditCard,    bg: 'bg-emerald-100 dark:bg-emerald-900/40', color: 'text-emerald-600 dark:text-emerald-400' },
  offer:    { icon: Tag,           bg: 'bg-amber-100 dark:bg-amber-900/40',   color: 'text-amber-600 dark:text-amber-400' },
  promo:    { icon: Tag,           bg: 'bg-violet-100 dark:bg-violet-900/40', color: 'text-violet-600 dark:text-violet-400' },
  reminder: { icon: Clock,         bg: 'bg-violet-100 dark:bg-violet-900/40', color: 'text-violet-600 dark:text-violet-400' },
  alert:    { icon: Clock,         bg: 'bg-amber-100 dark:bg-amber-900/40',   color: 'text-amber-600 dark:text-amber-400' },
  system:   { icon: CreditCard,    bg: 'bg-slate-100 dark:bg-slate-800',      color: 'text-slate-600 dark:text-slate-300' },
};

export function NotificationsCenter() {
  const { notifications, markRead, markAllRead, dismiss } = useNotificationStore();

  // Only show the latest 5 in the sidebar widget
  const visible = notifications.slice(0, 5);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="h-5 w-5 text-slate-700 dark:text-slate-200" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {unreadCount} unread
          </span>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            aria-label="Mark all notifications as read"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      {visible.length === 0 ? (
        <div className="py-10 text-center">
          <BellOff className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">You're all caught up!</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No new notifications.</p>
        </div>
      ) : (
        <div className="space-y-2" role="list" aria-label="Notifications">
          <AnimatePresence initial={false}>
            {visible.map((notification: AppNotification) => {
              const config = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.system;
              const Icon = config.icon;

              return (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`relative flex gap-3 rounded-xl p-4 transition-colors ${
                    notification.read
                      ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      : 'bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30'
                  }`}
                  role="listitem"
                  aria-label={notification.title}
                >
                  {/* Icon */}
                  <div className={`shrink-0 h-9 w-9 rounded-xl ${config.bg} flex items-center justify-center mt-0.5`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => markRead(notification.id)}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && markRead(notification.id)}
                    role="button"
                    aria-label={`Mark "${notification.title}" as read`}
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{notification.title}</p>
                      {!notification.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" aria-label="Unread" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{notification.time}</p>
                  </div>

                  {/* Dismiss */}
                  <button
                    onClick={() => dismiss(notification.id)}
                    className="shrink-0 p-1 rounded-lg text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label={`Dismiss notification: ${notification.title}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
