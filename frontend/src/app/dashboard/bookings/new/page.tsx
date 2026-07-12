'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Calendar, CreditCard, ShieldCheck, CheckCircle2, MapPin, AlignLeft, User, TestTube2, Copy, Info } from 'lucide-react';
import { carApi } from '@/lib/api/carApi';
import { bookingApi } from '@/lib/api/bookingApi';
import { paymentApi } from '@/lib/api/paymentApi';
import { Car } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { FormAlert } from '@/components/ui/FormAlert';
import { useAuthStore } from '@/lib/store/authStore';

// ─── Booking Schema ───────────────────────────────────────────────────────────
const bookingSchema = z.object({
  startDate: z.string().min(1, 'Pickup date is required'),
  endDate: z.string().min(1, 'Return date is required'),
  pickupLocation: z.string().min(1, 'Pickup location is required'),
  dropLocation: z.string().min(1, 'Drop location is required'),
  specialNotes: z.string().optional(),
}).refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
  message: 'Return date must be after pickup date',
  path: ['endDate'],
}).refine((data) => new Date(data.startDate) >= new Date(new Date().setHours(0,0,0,0)), {
  message: 'Pickup date cannot be in the past',
  path: ['startDate'],
});

type BookingForm = z.infer<typeof bookingSchema>;

// ─── Razorpay Script Loader ───────────────────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    // Guard: don't load the script twice (e.g. on retry)
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

// ─── Booking Form ─────────────────────────────────────────────────────────────
function BookingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const carId = searchParams.get('carId');
  const { user } = useAuthStore();

  const [car, setCar] = useState<Car | null>(null);
  const [isLoadingCar, setIsLoadingCar] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  // Calculate pricing
  const days = (startDate && endDate && new Date(startDate) <= new Date(endDate))
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  
  const subtotal = car ? days * car.dailyRate : 0;
  // Total matches exactly what the backend charges (dailyRate × days)
  const total = subtotal;

  useEffect(() => {
    if (!carId) {
      router.push('/cars');
      return;
    }
    carApi.getCarById(carId).then(data => {
      setCar(data);
      if (data.location?.address) {
        setValue('pickupLocation', data.location.address);
        setValue('dropLocation', data.location.address);
      }
      setIsLoadingCar(false);
    }).catch(() => {
      router.push('/cars');
    });
  }, [carId, router, setValue]);

  // ── Demo Payment bypass (for development / portfolio demos) ──────────────
  const [copyMsg, setCopyMsg] = useState('');
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyMsg(label);
      setTimeout(() => setCopyMsg(''), 1800);
    });
  };

  const runDemoPayment = async (data: BookingForm) => {
    if (!car) return;
    setIsSubmitting(true);
    setError('');
    try {
      const bookingResp = await bookingApi.createBooking({
        carId: car._id,
        startDate: data.startDate,
        endDate: data.endDate,
      });
      // Mark the payment as captured without going through the gateway
      await paymentApi.demoCapture(bookingResp.data._id);
      setSuccessModalOpen(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Demo payment failed. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: BookingForm) => {
    if (!car) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        setError('Razorpay SDK failed to load. Are you offline?');
        setIsSubmitting(false);
        return;
      }

      // 1. Create booking (Note: backend doesn't store locations/notes currently, but we validate them here)
      const bookingResp = await bookingApi.createBooking({
        carId: car._id,
        startDate: data.startDate,
        endDate: data.endDate,
      });

      // 2. Create Razorpay order
      const orderData = await paymentApi.createOrder(bookingResp.data._id);

      // 3. Open Razorpay checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'RentEase',
        description: `Booking for ${car.make} ${car.carModel}`,
        order_id: orderData.order_id,
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          try {
            await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setSuccessModalOpen(true);
          } catch {
            setError('Payment verification failed.');
          }
        },
        prefill: {
          name: user?.firstName || 'Customer',
          email: user?.email || '',
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: function() {
            setError('Payment cancelled. Please try again.');
          }
        }
      };

      const RazorpayConstructor = (window as unknown as { Razorpay: new (opts: typeof options) => { on: (event: string, cb: () => void) => void; open: () => void } }).Razorpay;
      const rzp = new RazorpayConstructor(options);
      rzp.on('payment.failed', function () {
        setError('Payment failed. Please try again.');
      });
      rzp.open();

    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to process booking. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalOpen(false);
    router.push('/dashboard/bookings');
  };

  if (isLoadingCar) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4 text-slate-400 dark:text-slate-500">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Loading booking details...
        </div>
      </div>
    );
  }

  if (!car) return null;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <Link href={`/cars/${car._id}`} className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to car details
      </Link>

      <div className="grid lg:grid-cols-5 gap-8">
        
        {/* Left: Form */}
        <div className="lg:col-span-3 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Complete your booking</h1>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate aria-label="Booking form">
              
              {/* User Information */}
              <section>
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" /> 1. Primary Driver Info
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                    <input type="text" readOnly value={user?.firstName || ''} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                    <input type="email" readOnly value={user?.email || ''} className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                  </div>
                </div>
              </section>

              {/* Dates */}
              <section>
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" /> 2. Rental Dates
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input type="date" label="Pickup Date" error={errors.startDate?.message} {...register('startDate')} />
                  <Input type="date" label="Return Date" error={errors.endDate?.message} {...register('endDate')} />
                </div>
              </section>

              {/* Locations */}
              <section>
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" /> 3. Locations
                </h2>
                <div className="space-y-4">
                  <Input type="text" label="Pickup Location" placeholder="Enter pickup address" error={errors.pickupLocation?.message} {...register('pickupLocation')} />
                  <Input type="text" label="Drop Location" placeholder="Enter return address" error={errors.dropLocation?.message} {...register('dropLocation')} />
                </div>
              </section>

              {/* Special Notes */}
              <section>
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  <AlignLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" /> 4. Special Notes (Optional)
                </h2>
                <textarea 
                  {...register('specialNotes')}
                  placeholder="Any special requests or instructions..."
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y" 
                />
              </section>

              {/* Payment Info */}
              <section>
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                  <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" /> 5. Payment Method
                </h2>

                {/* Test Card Details Banner */}
                <div className="mb-4 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/20 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-100 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800/40">
                    <TestTube2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">Razorpay Test Mode — Indian Cards</span>
                  </div>
                  <div className="p-4 space-y-2.5">
                    {[
                      { label: 'Card Number', value: '4111 1111 1111 1111' },
                      { label: 'Expiry', value: '12/26' },
                      { label: 'CVV', value: '123' },
                      { label: 'OTP (if asked)', value: '1234' },
                      { label: 'UPI VPA', value: 'success@razorpay' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between gap-3">
                        <span className="text-xs text-amber-700 dark:text-amber-400 font-medium w-28">{label}</span>
                        <code className="text-xs font-mono font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-md flex-1">{value}</code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(value, label)}
                          className="shrink-0 p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors"
                          title={`Copy ${label}`}
                        >
                          {copyMsg === label ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Demo bypass */}
                <div className="mb-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/20 p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Skip Gateway (Portfolio Demo)</p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">Instantly confirm the booking without opening Razorpay. Use this to demo a successful payment flow.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={days === 0 || isSubmitting}
                    onClick={handleSubmit(runDemoPayment)}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors"
                  >
                    <TestTube2 className="h-4 w-4" />
                    Use Demo Payment — Skip Gateway
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Or click "Proceed To Payment" below to go through the real Razorpay checkout. We do not store your card details.
                  </p>
                </div>
              </section>

              {error && <FormAlert type="error" message={error} onDismiss={() => setError('')} />}

              <Button type="submit" isLoading={isSubmitting} disabled={days === 0} className="w-full h-14 text-lg font-bold shadow-lg shadow-blue-600/20">
                Proceed To Payment
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="font-bold text-slate-900 dark:text-white mb-6">Booking Summary</h2>
            
            <div className="flex gap-4 mb-6">
              <div className="w-24 h-20 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={car.images?.[0] || ''} alt={car.carModel} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{car.make} {car.carModel}</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{car.year} &bull; <span className="capitalize">{car.category}</span></p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Daily rate</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{car.dailyRate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Duration</span>
                <span className="font-bold text-slate-900 dark:text-white">{days} day{days !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-end">
              <span className="font-bold text-slate-900 dark:text-white">Total Amount</span>
              <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">₹{total.toFixed(2)}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal isOpen={successModalOpen} onClose={handleSuccessClose} maxWidth="sm">
        <div className="text-center py-6">
          <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Payment Successful!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Your booking for the {car.make} {car.carModel} is confirmed. We&apos;ve sent a receipt to your email.
          </p>
          <Button onClick={handleSuccessClose} className="w-full">
            View My Bookings
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-900 max-w-5xl mx-auto" />}>
      <BookingFlow />
    </Suspense>
  );
}
