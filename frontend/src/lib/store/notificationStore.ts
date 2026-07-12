/**
 * Notification Store (Zustand + localStorage persistence)
 * ─────────────────────────────────────────────────────────
 * Persists read/dismissed state across page refreshes.
 * In production this would sync with the backend API.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotifType = 'booking' | 'payment' | 'system' | 'promo' | 'alert' | 'offer' | 'reminder';

export interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
}

// ─── Default notifications (seeded once, never re-added) ──────────────────────

export const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-booking-1',
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Your booking for BMW 5 Series (24 Jun – 26 Jun) has been confirmed. Get ready for your trip!',
    time: '2 hours ago',
    read: false,
    actionLabel: 'View Booking',
    actionHref: '/dashboard/bookings',
  },
  {
    id: 'n-payment-1',
    type: 'payment',
    title: 'Payment Received',
    message: 'We received your payment of ₹9,000 for booking #A4F9B2. A receipt has been sent to your email.',
    time: '5 hours ago',
    read: false,
    actionLabel: 'View Payments',
    actionHref: '/dashboard/payments',
  },
  {
    id: 'n-promo-1',
    type: 'promo',
    title: '🎉 Weekend Special — 20% Off!',
    message: 'Book any car this weekend and get 20% off. Use code WEEKEND20 at checkout. Offer expires Sunday midnight.',
    time: '1 day ago',
    read: false,
    actionLabel: 'Browse Cars',
    actionHref: '/cars',
  },
  {
    id: 'n-alert-1',
    type: 'alert',
    title: 'Upcoming Trip Reminder',
    message: 'Your rental of Audi A6 starts tomorrow (25 Jun). Please ensure your documents are ready.',
    time: '1 day ago',
    read: true,
    actionLabel: 'View Details',
    actionHref: '/dashboard/bookings',
  },
  {
    id: 'n-system-1',
    type: 'system',
    title: 'Profile Updated',
    message: "Your profile information was successfully updated. If this wasn't you, please change your password immediately.",
    time: '3 days ago',
    read: true,
    actionLabel: 'Go to Settings',
    actionHref: '/dashboard/settings',
  },
  {
    id: 'n-booking-2',
    type: 'booking',
    title: 'Booking Cancelled',
    message: 'Your booking for Audi A6 (22 Jun – 26 Jun) was cancelled. Refund will be processed within 5–7 business days.',
    time: '4 days ago',
    read: true,
  },
  {
    id: 'n-promo-2',
    type: 'promo',
    title: 'New Cars Added to Fleet',
    message: "We've added 12 new premium vehicles including Mercedes GLC, BMW X5, and Porsche Cayenne. Check them out!",
    time: '5 days ago',
    read: true,
    actionLabel: 'Browse New Cars',
    actionHref: '/cars',
  },
  {
    id: 'n-system-2',
    type: 'system',
    title: 'Security Notice',
    message: 'Your account was accessed from a new device (Windows, Chrome). If this was you, no action is needed.',
    time: '1 week ago',
    read: true,
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────

interface NotificationState {
  notifications: AppNotification[];
  _seeded: boolean;

  // Actions
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
  addNotification: (n: AppNotification) => void;
  /** Call once on app start to seed defaults if never seeded before */
  seedIfEmpty: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: DEFAULT_NOTIFICATIONS,
      _seeded: true,

      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      dismiss: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
        })),

      clearAll: () => set({ notifications: [] }),

      addNotification: (n) =>
        set((s) => ({
          notifications: [n, ...s.notifications],
        })),

      seedIfEmpty: () => {
        const { _seeded } = get();
        if (!_seeded) {
          set({ notifications: DEFAULT_NOTIFICATIONS, _seeded: true });
        }
      },
    }),
    {
      name: 'rentease-notifications',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
