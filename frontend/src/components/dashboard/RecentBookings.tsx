'use client';

import { motion } from 'framer-motion';
import { CalendarDays, ArrowRight, Car, RefreshCw, ClipboardList } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Booking, Car as CarType } from '@/types';
import { format } from 'date-fns';

interface RecentBookingsProps {
  bookings: Booking[];
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmed', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' };
    case 'completed':
      return { label: 'Completed', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' };
    case 'cancelled':
      return { label: 'Cancelled', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' };
    case 'pending':
      return { label: 'Pending', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' };
    case 'active':
      return { label: 'Active', className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400' };
    default:
      return { label: status, className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
  }
}

function BookingRow({ booking, index }: { booking: Booking; index: number }) {
  const car = booking.car as CarType;
  const status = getStatusConfig(booking.status);
  const hasImage = car?.images && car.images.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="flex items-center gap-4 py-4 border-b border-slate-100 dark:border-slate-800 last:border-0 group"
      role="row"
    >
      {/* Car thumbnail */}
      <div className="h-14 w-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
        {hasImage ? (
          <Image
            src={car.images[0]}
            alt={`${car.make} ${car.carModel}`}
            width={80}
            height={56}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Car className="h-6 w-6 text-slate-300 dark:text-slate-600" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
          {car?.make} {car?.carModel}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <CalendarDays className="h-3 w-3 text-slate-400 shrink-0" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {format(new Date(booking.startDate), 'dd MMM')} — {format(new Date(booking.endDate), 'dd MMM yyyy')}
          </p>
        </div>
      </div>

      {/* Status */}
      <span className={`hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${status.className}`}>
        {status.label}
      </span>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          ₹{booking.totalAmount?.toLocaleString()}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{booking.totalDays}d</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Link
          href={`/dashboard/bookings/${booking._id}`}
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
          aria-label="View booking details"
          title="View Details"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
        {booking.status === 'completed' && (
          <Link
            href={`/cars/${typeof car === 'string' ? car : car?._id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
            aria-label="Rebook this car"
            title="Rebook"
          >
            <RefreshCw className="h-4 w-4" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

export function RecentBookings({ bookings }: RecentBookingsProps) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 text-center">
        <ClipboardList className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">No bookings yet</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4">
          Your booking history will appear here once you make your first rental.
        </p>
        <Link
          href="/cars"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
        >
          <Car className="h-4 w-4" />
          Browse Cars
        </Link>
      </div>
    );
  }

  return (
    <div role="table" aria-label="Recent bookings">
      {bookings.map((booking, i) => (
        <BookingRow key={booking._id} booking={booking} index={i} />
      ))}
      <div className="pt-4">
        <Link
          href="/dashboard/bookings"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          View all bookings <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
