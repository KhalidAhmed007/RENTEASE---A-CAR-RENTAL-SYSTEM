'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, CalendarCheck, CalendarX, Car, CreditCard, Clock
} from 'lucide-react';

interface ActivityEvent {
  id: string;
  type: 'user_registered' | 'booking_created' | 'booking_cancelled' | 'car_added' | 'payment_received';
  title: string;
  detail: string;
  time: string;
}

const MOCK_ACTIVITIES: ActivityEvent[] = [
  { id: 'a1', type: 'user_registered', title: 'New User Registered', detail: 'sarah.jones@email.com joined', time: '2 min ago' },
  { id: 'a2', type: 'booking_created', title: 'Booking Created', detail: 'Tesla Model 3 — 5 days', time: '8 min ago' },
  { id: 'a3', type: 'payment_received', title: 'Payment Received', detail: '₹12,500 for booking #BK-204', time: '15 min ago' },
  { id: 'a4', type: 'booking_cancelled', title: 'Booking Cancelled', detail: 'BMW X5 — refund initiated', time: '32 min ago' },
  { id: 'a5', type: 'car_added', title: 'Car Added to Fleet', detail: 'Audi Q7 2024 — Luxury SUV', time: '1 hour ago' },
  { id: 'a6', type: 'user_registered', title: 'New User Registered', detail: 'mark.lee@email.com joined', time: '1.5 hours ago' },
  { id: 'a7', type: 'payment_received', title: 'Payment Received', detail: '₹7,200 for booking #BK-203', time: '2 hours ago' },
];

const TYPE_CONFIG = {
  user_registered:  { icon: UserPlus,       bg: 'bg-violet-100 dark:bg-violet-900/40', color: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500' },
  booking_created:  { icon: CalendarCheck,   bg: 'bg-blue-100 dark:bg-blue-900/40',    color: 'text-blue-600 dark:text-blue-400',    dot: 'bg-blue-500' },
  booking_cancelled:{ icon: CalendarX,       bg: 'bg-red-100 dark:bg-red-900/40',      color: 'text-red-600 dark:text-red-400',      dot: 'bg-red-500' },
  car_added:        { icon: Car,             bg: 'bg-emerald-100 dark:bg-emerald-900/40', color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  payment_received: { icon: CreditCard,      bg: 'bg-amber-100 dark:bg-amber-900/40',  color: 'text-amber-600 dark:text-amber-400',  dot: 'bg-amber-500' },
};

export function ActivityFeed() {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[19px] top-4 bottom-4 w-px bg-slate-100 dark:bg-slate-800" aria-hidden="true" />

      <div className="space-y-1" role="list" aria-label="Recent admin activity">
        <AnimatePresence initial={false}>
          {MOCK_ACTIVITIES.map((event, i) => {
            const config = TYPE_CONFIG[event.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex gap-3 py-2.5 group"
                role="listitem"
              >
                {/* Icon dot */}
                <div className={`relative z-10 shrink-0 flex h-9 w-9 items-center justify-center rounded-xl ${config.bg} mt-0.5`}>
                  <Icon className={`h-4 w-4 ${config.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">{event.title}</p>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 shrink-0 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {event.time}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{event.detail}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
