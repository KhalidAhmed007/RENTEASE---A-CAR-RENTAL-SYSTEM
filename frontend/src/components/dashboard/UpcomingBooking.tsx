'use client';

import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Clock, ArrowRight, X, Eye, Car } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Booking, Car as CarType } from '@/types';
import { format, differenceInDays } from 'date-fns';

interface UpcomingBookingCardProps {
  booking: Booking;
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmed', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', dot: 'bg-emerald-500' };
    case 'active':
      return { label: 'Active', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', dot: 'bg-blue-500' };
    case 'pending':
      return { label: 'Pending', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', dot: 'bg-amber-500' };
    default:
      return { label: status, className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', dot: 'bg-slate-400' };
  }
}

function CarImagePlaceholder({ make }: { make: string }) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50">
      <div className="text-center">
        <Car className="h-10 w-10 text-blue-300 dark:text-blue-600 mx-auto mb-1" />
        <p className="text-xs font-medium text-blue-400 dark:text-blue-500">{make}</p>
      </div>
    </div>
  );
}

export function UpcomingBookingCard({ booking }: UpcomingBookingCardProps) {
  const car = booking.car as CarType;
  const statusConfig = getStatusConfig(booking.status);
  const startDate = new Date(booking.startDate);
  const endDate = new Date(booking.endDate);
  const daysUntil = differenceInDays(startDate, new Date());
  const hasImage = car?.images && car.images.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
      role="article"
      aria-label={`Upcoming booking for ${car?.make ?? 'Vehicle'} ${car?.carModel ?? ''}`}
    >
      {/* Header accent */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Car image */}
          <div className="h-32 w-full sm:w-48 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
            {hasImage ? (
              <Image
                src={car.images[0]}
                alt={`${car.make} ${car.carModel}`}
                width={192}
                height={128}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <CarImagePlaceholder make={car?.make ?? 'Car'} />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {car?.make} {car?.carModel}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 capitalize">
                  {car?.category} · {car?.year}
                </p>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${statusConfig.className}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                {statusConfig.label}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow icon={CalendarDays} label="Pickup">
                {format(startDate, 'dd MMM yyyy')}
              </InfoRow>
              <InfoRow icon={CalendarDays} label="Return">
                {format(endDate, 'dd MMM yyyy')}
              </InfoRow>
              <InfoRow icon={Clock} label="Duration">
                {booking.totalDays} day{booking.totalDays !== 1 ? 's' : ''}
              </InfoRow>
              <InfoRow icon={MapPin} label="Location">
                {car?.location?.address?.split(',')[0] ?? 'Pickup point'}
              </InfoRow>
            </div>

            <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Amount</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  ₹{booking.totalAmount?.toLocaleString()}
                </p>
              </div>

              {daysUntil >= 0 && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                  <Clock className="h-3 w-3" />
                  {daysUntil === 0 ? 'Today!' : `${daysUntil} day${daysUntil !== 1 ? 's' : ''} away`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
          <Link
            href={`/dashboard/bookings/${booking._id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            aria-label="View booking details"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Link>
          <Link
            href="/dashboard/bookings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
            aria-label="Manage bookings"
          >
            <ArrowRight className="h-4 w-4" />
            Manage
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof CalendarDays;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{children}</p>
      </div>
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────

export function UpcomingBookingEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 text-center"
      role="status"
      aria-label="No upcoming trips"
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/50">
        <Car className="h-8 w-8 text-blue-400 dark:text-blue-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No upcoming trips</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-6">
        Start exploring our premium fleet and book your next ride. Your adventure is just a click away.
      </p>
      <Link
        href="/cars"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-md hover:shadow-lg"
        aria-label="Browse available cars"
      >
        <Car className="h-4 w-4" />
        Browse Cars
        <ArrowRight className="h-4 w-4" />
      </Link>
    </motion.div>
  );
}
