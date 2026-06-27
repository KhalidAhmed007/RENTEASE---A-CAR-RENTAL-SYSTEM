'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, XCircle, FileText, ChevronRight, AlertCircle,
  Car as CarIcon, MapPin, CheckCircle2, AlertTriangle,
  Clock, RotateCcw, Download, CreditCard, Sparkles,
  ArrowRight, TrendingUp, Shield
} from 'lucide-react';
import { bookingApi } from '@/lib/api/bookingApi';
import { Booking } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import Image from 'next/image';

const PLACEHOLDER = '/images/cars/placeholder-car.jpg';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, {
  label: string; icon: React.ElementType;
  badge: string; dot: string;
}> = {
  pending:   { label: 'Pending Payment', icon: Clock,         badge: 'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400  border border-amber-200  dark:border-amber-800',  dot: 'bg-amber-400' },
  confirmed: { label: 'Confirmed',       icon: CheckCircle2,  badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-400' },
  active:    { label: 'Active',          icon: CarIcon,       badge: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400   border border-blue-200   dark:border-blue-800',   dot: 'bg-blue-400' },
  completed: { label: 'Completed',       icon: CheckCircle2,  badge: 'bg-slate-100  text-slate-600  dark:bg-slate-800     dark:text-slate-300  border border-slate-200  dark:border-slate-700',  dot: 'bg-slate-400' },
  cancelled: { label: 'Cancelled',       icon: XCircle,       badge: 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400    border border-red-200    dark:border-red-800',    dot: 'bg-red-400' },
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);

  const fetchBookings = async () => {
    try {
      const data = await bookingApi.getMyBookings({ limit: 50 });
      setBookings(data.bookings);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Failed to load bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancelClick = (id: string) => {
    setSelectedBookingId(id);
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedBookingId) return;
    setIsCancelling(true);
    try {
      await bookingApi.cancelBooking(selectedBookingId);
      setBookings(prev => prev.map(b => b._id === selectedBookingId ? { ...b, status: 'cancelled' } : b));
      setCancelModalOpen(false);
    } catch {
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your booking history? This will delete all completed and cancelled bookings.')) {
      return;
    }
    setIsClearingHistory(true);
    try {
      await bookingApi.clearBookingHistory();
      setBookings(prev => prev.filter(b => !['completed', 'cancelled'].includes(b.status)));
    } catch (err: unknown) {
      alert('Failed to clear booking history. Please try again.');
    } finally {
      setIsClearingHistory(false);
    }
  };

  // Derived
  const upcomingBookings  = bookings.filter(b => ['pending', 'confirmed', 'active'].includes(b.status));
  const pastBookings      = bookings.filter(b => ['completed', 'cancelled'].includes(b.status));
  const completedCount    = bookings.filter(b => b.status === 'completed').length;
  const cancelledCount    = bookings.filter(b => b.status === 'cancelled').length;
  const totalSpent        = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.totalAmount || 0), 0);

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 p-4 rounded-2xl border border-red-200 dark:border-red-800">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-6xl">

      {/* ── HERO HEADER ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 shadow-xl shadow-blue-200 dark:shadow-blue-950/50">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-8 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-6 right-6 w-16 h-16 rounded-full bg-white/10" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <CarIcon className="h-4 w-4 text-white" />
              </div>
              <span className="text-blue-200 text-sm font-medium">My Trips</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">My Bookings</h1>
            <p className="mt-2 text-blue-200 text-sm max-w-md">
              Manage your upcoming trips and explore your complete rental history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 font-semibold text-sm rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              Browse Cars
            </Link>
          </div>
        </div>

        {/* Quick stat strip */}
        {!isLoading && bookings.length > 0 && (
          <div className="relative z-10 mt-8 grid grid-cols-3 gap-4">
            {[
              { label: 'Total Trips',    value: bookings.length,    icon: FileText },
              { label: 'Upcoming',       value: upcomingBookings.length, icon: Calendar },
              { label: 'Total Spent',    value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: CreditCard },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-3.5 w-3.5 text-blue-200" />
                  <p className="text-xs text-blue-200">{label}</p>
                </div>
                <p className="text-xl font-bold">{value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── LOADING STATE ─────────────────────────────────────────── */}
      {isLoading && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ───────────────────────────────────────────── */}
      {!isLoading && bookings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="mx-auto mb-5 w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-900/30 flex items-center justify-center shadow-inner">
            <CarIcon className="h-10 w-10 text-blue-500 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No bookings yet</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto text-sm">
            Explore our premium fleet and book your first ride in seconds.
          </p>
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200 dark:shadow-blue-950"
          >
            Browse Cars <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      )}

      {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
      {!isLoading && bookings.length > 0 && (
        <div className="space-y-10">

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Total Trips',  value: bookings.length,    icon: FileText,     color: 'from-blue-500 to-blue-600',     bg: 'bg-blue-50 dark:bg-blue-950/40' },
              { title: 'Upcoming',     value: upcomingBookings.length, icon: Calendar, color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-950/40' },
              { title: 'Completed',    value: completedCount,     icon: CheckCircle2, color: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
              { title: 'Cancelled',    value: cancelledCount,     icon: XCircle,      color: 'from-red-400 to-red-600',       bg: 'bg-red-50 dark:bg-red-950/40' },
            ].map(({ title, value, icon: Icon, color, bg }, idx) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon className="h-4 w-4 text-current opacity-70" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
              </motion.div>
            ))}
          </div>

          {/* ── UPCOMING BOOKINGS ──────────────────────────────────── */}
          {upcomingBookings.length > 0 && (
            <section className="space-y-4">
              <SectionHeading icon={Calendar} title="Upcoming Trips" subtitle={`${upcomingBookings.length} scheduled`} />
              <div className="grid gap-5">
                {upcomingBookings.map((b, i) => (
                  <BookingCard key={b._id} booking={b} index={i} onCancel={() => handleCancelClick(b._id)} variant="upcoming" />
                ))}
              </div>
            </section>
          )}

          {/* ── BOOKING HISTORY ────────────────────────────────────── */}
          {pastBookings.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeading icon={FileText} title="Booking History" subtitle={`${pastBookings.length} past trips`} />
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleClearHistory}
                    disabled={isClearingHistory}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl border border-red-200 dark:border-red-800 transition-colors shadow-sm disabled:opacity-50"
                  >
                    Clear History
                  </button>
                  <Link
                    href="/cars"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-blue-200/50 dark:shadow-blue-950/50"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Book Again
                  </Link>
                </div>
              </div>
              <div className="grid gap-4">
                {pastBookings.map((b, i) => (
                  <BookingCard key={b._id} booking={b} index={i} onCancel={() => handleCancelClick(b._id)} variant="history" />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── CANCEL MODAL ──────────────────────────────────────────── */}
      <Modal isOpen={cancelModalOpen} onClose={() => !isCancelling && setCancelModalOpen(false)} title="Cancel Booking">
        <div className="py-2 space-y-5">
          <div className="flex gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-700 dark:text-red-300">This action cannot be undone.</p>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            Are you sure you want to cancel this booking? Any paid amounts will be reviewed and refunded according to our cancellation policy.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setCancelModalOpen(false)} disabled={isCancelling}>
              Keep Booking
            </Button>
            <Button variant="danger" onClick={confirmCancel} isLoading={isCancelling}>
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Section Heading ──────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Icon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

const STATUS_BORDER: Record<string, string> = {
  pending:   'border-l-amber-500',
  confirmed: 'border-l-emerald-500',
  active:    'border-l-blue-500',
  completed: 'border-l-slate-400',
  cancelled: 'border-l-red-500',
};

// ─── Booking Card ─────────────────────────────────────────────────────────────
function BookingCard({
  booking, index, onCancel, variant
}: { booking: Booking; index: number; onCancel: () => void; variant: 'upcoming' | 'history' }) {
  const car = booking.car as any;
  const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const isCancellable = ['pending', 'confirmed'].includes(booking.status);
  const isPending     = booking.status === 'pending';
  const isHistory     = variant === 'history';

  // Booking reference (last 8 chars of _id)
  const ref = booking._id.slice(-8).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 border-l-4 ${STATUS_BORDER[booking.status] || 'border-l-slate-400'} shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden`}
    >
      <div className={`flex flex-col ${isHistory ? 'sm:flex-row sm:items-center' : 'md:flex-row'}`}>

        {/* Car Image */}
        <div className={`relative shrink-0 bg-slate-100 dark:bg-slate-800 overflow-hidden ${
          isHistory ? 'w-full sm:w-32 h-32 sm:h-full rounded-none' : 'w-full md:w-72 h-48 md:h-auto rounded-none'
        }`}>
          <Image
            src={car?.images?.[0] || PLACEHOLDER}
            alt={car?.carModel || 'Car'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Category pill */}
          {car?.category && (
            <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full capitalize">
              {car.category}
            </span>
          )}
        </div>

        {/* Content */}
        <div className={`flex-1 p-5 ${isHistory ? '' : 'p-6'}`}>
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <h3 className={`font-bold text-slate-900 dark:text-white ${isHistory ? 'text-base' : 'text-xl'}`}>
                {car?.make} {car?.carModel}
              </h3>
              {!isHistory && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{car?.year} · {car?.category}</p>
              )}
            </div>

            {/* Status badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {cfg.label}
            </span>
          </div>

          {/* Details grid */}
          <div className={`grid ${isHistory ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'} gap-3 mb-4`}>
            {/* Dates */}
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <span>
                {new Date(booking.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                {' → '}
                {new Date(booking.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Location */}
            {car?.location?.address && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="line-clamp-1">{car.location.address}</span>
              </div>
            )}

            {/* Booking ref */}
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Shield className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="font-mono">#{ref}</span>
            </div>
          </div>

          {/* Footer: amount + actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* Amount */}
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Total Amount</p>
              <p className={`font-bold text-slate-900 dark:text-white ${isHistory ? 'text-base' : 'text-lg'}`}>
                ₹{booking.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Pay Now — only pending */}
              {isPending && (
                <Link
                  href="/dashboard/payments"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                >
                  <CreditCard className="h-3.5 w-3.5" /> Pay Now
                </Link>
              )}

              {/* Rebook — only completed/cancelled */}
              {['completed', 'cancelled'].includes(booking.status) && car?._id && (
                <Link
                  href={`/cars/${car._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Rebook
                </Link>
              )}

              {/* View Car */}
              {car?._id && (
                <Link
                  href={`/cars/${car._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                >
                  View Car <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}

              {/* Cancel */}
              {isCancellable && (
                <button
                  onClick={onCancel}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800 transition-colors"
                >
                  <XCircle className="h-3.5 w-3.5" /> Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
