'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { bookingApi } from '@/lib/api/bookingApi';
import { Button } from '@/components/ui/Button';
import { FormAlert } from '@/components/ui/FormAlert';
import { useAuthStore } from '@/lib/store/authStore';

const bookingSchema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
}).refine((data) => new Date(data.startDate) < new Date(data.endDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
}).refine((data) => new Date(data.startDate) >= new Date(new Date().setHours(0,0,0,0)), {
  message: 'Start date cannot be in the past',
  path: ['startDate'],
});

type BookingForm = z.infer<typeof bookingSchema>;

interface BookingWidgetProps {
  carId: string;
  dailyRate: number;
  isAvailable: boolean;
}

export function BookingWidget({ carId, dailyRate, isAvailable }: BookingWidgetProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const days = (startDate && endDate && new Date(startDate) <= new Date(endDate))
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const total = days * dailyRate;

  const onSubmit = async (data: BookingForm) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/cars/' + carId);
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      await bookingApi.createBooking({
        carId,
        startDate: data.startDate,
        endDate: data.endDate,
      });

      // Navigate to payments page after successful booking creation
      router.push('/dashboard/payments');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to process booking. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Pickup Date</label>
          <input 
            type="date" 
            {...register('startDate')}
            className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
          {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Return Date</label>
          <input 
            type="date" 
            {...register('endDate')}
            className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
          />
          {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate.message}</p>}
        </div>
      </div>

      {days > 0 && (
        <div className="flex justify-between items-center py-3 border-y border-slate-100 dark:border-slate-800 mb-4">
          <span className="text-sm text-slate-500 dark:text-slate-400">Total for {days} day{days > 1 ? 's' : ''}</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white">₹{total.toFixed(2)}</span>
        </div>
      )}

      {error && <FormAlert type="error" message={error} onDismiss={() => setError('')} />}

      <Button 
        type="submit" 
        disabled={!isAvailable} 
        isLoading={isSubmitting}
        className="w-full py-3.5 text-sm"
      >
        {isAvailable ? 'Confirm Booking' : 'Currently Unavailable'}
      </Button>
    </form>
  );
}
