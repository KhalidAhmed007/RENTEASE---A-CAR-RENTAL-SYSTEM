'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, CheckCircle2, XCircle, Clock, RefreshCcw,
  Loader2, AlertCircle, Receipt, ArrowRight, Car, Info
} from 'lucide-react';
import { api } from '@/lib/api/axios';
import { paymentApi } from '@/lib/api/paymentApi';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store/authStore';

// ─── Razorpay Script Loader ───────────────────────────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as unknown as Record<string, unknown>).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface CarInfo {
  make: string;
  carModel: string;
  year: number;
  images?: string[];
}

interface BookingInfo {
  _id: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: string;
  car?: CarInfo;
}

interface Payment {
  _id: string;
  booking: BookingInfo;
  transactionId?: string;
  razorpayPaymentId?: string;
  paymentProvider: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  createdAt: string;
}

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig: Record<string, {
  icon: React.ElementType; color: string; bg: string;
  label: string; border: string;
}> = {
  succeeded: { icon: CheckCircle2, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40', border: 'border-emerald-200 dark:border-emerald-800', label: 'Paid' },
  pending:   { icon: Clock,        color: 'text-amber-700 dark:text-amber-400',   bg: 'bg-amber-100 dark:bg-amber-900/40',   border: 'border-amber-200 dark:border-amber-800',   label: 'Pending' },
  failed:    { icon: XCircle,      color: 'text-red-700 dark:text-red-400',       bg: 'bg-red-100 dark:bg-red-900/40',       border: 'border-red-200 dark:border-red-800',       label: 'Failed' },
  refunded:  { icon: RefreshCcw,   color: 'text-blue-700 dark:text-blue-400',     bg: 'bg-blue-100 dark:bg-blue-900/40',     border: 'border-blue-200 dark:border-blue-800',     label: 'Refunded' },
};

// ─── Helper: format car name ──────────────────────────────────────────────────
function getCarName(car?: CarInfo): string {
  if (!car) return 'Vehicle';
  const parts = [car.make, car.carModel, car.year].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Vehicle';
}

// ─── Helper: format currency ──────────────────────────────────────────────────
function formatCurrency(amount: number, currency: string): string {
  const symbol = currency?.toUpperCase() === 'INR' ? '₹' : '$';
  return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const fetchPayments = () => {
    setIsLoading(true);
    api.get('/payments/history')
      .then(res => setPayments(res.data.data ?? []))
      .catch(e => setError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Failed to load payment history.'
      ))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchPayments(); }, []);

  const handlePayNow = async (payment: Payment) => {
    if (!payment.booking?._id) return;
    setPayingId(payment._id);
    setError('');

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setError('Failed to load Razorpay. Please check your internet connection.');
        setPayingId(null);
        return;
      }

      const orderData = await paymentApi.createOrder(payment.booking._id);

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'RentEase',
        description: `Car Rental — ${getCarName(payment.booking.car)}`,
        image: '/logo.png',
        order_id: orderData.order_id,
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setSuccessId(payment._id);
            fetchPayments();
          } catch {
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.firstName || 'Customer',
          email: user?.email || '',
        },
        notes: {
          booking_id: payment.booking._id,
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: () => setPayingId(null),
        },
      };

      type RazorpayInstance = { on: (e: string, cb: () => void) => void; open: () => void };
      const RazorpayConstructor = (window as unknown as { Razorpay: new (o: typeof options) => RazorpayInstance }).Razorpay;
      const rzp = new RazorpayConstructor(options);
      rzp.on('payment.failed', () => {
        setError('Payment failed. Please try again or use a different payment method.');
        setPayingId(null);
      });
      rzp.open();

    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Failed to initiate payment. Please try again.');
      setPayingId(null);
    }
  };

  // ─── Computed stats ────────────────────────────────────────────────────────
  const succeeded = payments.filter(p => p.status === 'succeeded');
  const pending   = payments.filter(p => p.status === 'pending');
  const totalSpent = succeeded.reduce((sum, p) => sum + p.amount, 0);
  const currency = payments[0]?.currency || 'INR';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Payments</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Your complete billing history and invoices.</p>
      </div>

      {/* Error banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-5 py-4 text-sm text-red-700 dark:text-red-400"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{error}</p>
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 dark:hover:text-red-300 text-xs underline">Dismiss</button>
        </motion.div>
      )}

      {/* Success banner */}
      {successId && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-5 py-4 text-sm text-emerald-700 dark:text-emerald-400"
        >
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p>Payment successful! Your booking is now confirmed.</p>
          <button onClick={() => setSuccessId(null)} className="ml-auto text-emerald-400 hover:text-emerald-600 text-xs underline">Dismiss</button>
        </motion.div>
      )}

      {/* Summary Cards */}
      {!isLoading && payments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-4"
        >
          {[
            { label: 'Total Spent',   value: formatCurrency(totalSpent, currency), color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-950/40',    icon: CreditCard },
            { label: 'Transactions',  value: payments.length.toString(),            color: 'text-slate-700 dark:text-slate-200',  bg: 'bg-slate-50 dark:bg-slate-800',     icon: Receipt },
            { label: 'Successful',    value: succeeded.length.toString(),           color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40', icon: CheckCircle2 },
            { label: 'Pending',       value: pending.length.toString(),             color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-950/40',  icon: Clock },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Payments Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-slate-400">Loading your payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20">
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-violet-500 dark:text-violet-400" />
            </div>
            <p className="text-base font-bold text-slate-900 dark:text-white">No payments yet</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Invoices and receipts appear here once you complete a booking payment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table" aria-label="Payment history">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  {['Date', 'Vehicle', 'Rental Period', 'Amount', 'Status', 'Reference'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {payments.map((p, i) => {
                  const cfg = statusConfig[p.status] ?? statusConfig.pending;
                  const Icon = cfg.icon;
                  const carName = getCarName(p.booking?.car);
                  const ref = p.razorpayPaymentId || p.transactionId || null;

                  return (
                    <motion.tr
                      key={p._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Date */}
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Vehicle */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <Car className="h-4 w-4 text-slate-400" />
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white">{carName}</span>
                        </div>
                      </td>

                      {/* Rental Period */}
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {p.booking
                          ? `${new Date(p.booking.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} → ${new Date(p.booking.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
                          : '—'}
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatCurrency(p.amount, p.currency)}
                        </span>
                      </td>

                      {/* Status + Pay Now */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {cfg.label}
                        </span>
                        {p.status === 'pending' && (
                          <div className="mt-2">
                            <Button
                              variant="primary"
                              className="text-xs h-8 px-3 w-full"
                              isLoading={payingId === p._id}
                              onClick={() => handlePayNow(p)}
                              aria-label={`Pay now for ${carName}`}
                            >
                              {payingId === p._id ? 'Opening...' : <>Pay Now <ArrowRight className="h-3 w-3 ml-1 inline" /></>}
                            </Button>
                          </div>
                        )}
                      </td>

                      {/* Reference ID */}
                      <td className="px-5 py-4 text-slate-400 dark:text-slate-500 font-mono text-xs truncate max-w-[130px]" title={ref ?? undefined}>
                        {ref ? ref.slice(-12) : '—'}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Test mode info */}
      <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20 px-5 py-4">
        <div className="flex gap-3 items-start">
          <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-semibold mb-1">Razorpay Test Mode</p>
            <p className="text-blue-700 dark:text-blue-400 text-xs leading-relaxed">
              Payments run in <strong>test mode</strong>. Use card <code className="bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded font-mono">4111 1111 1111 1111</code>, 
              any future expiry, CVV <code className="bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded font-mono">any 3 digits</code>. 
              For UPI test, enter <code className="bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded font-mono">success@razorpay</code>.
              No real money is charged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
