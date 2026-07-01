'use client';

import { useState, useEffect } from 'react';
import { bookingApi } from '@/lib/api/bookingApi';
import { carApi } from '@/lib/api/carApi';
import { Booking, Car } from '@/types';

export interface DashboardData {
  upcomingBookings: Booking[];
  recentBookings: Booking[];
  totalBookings: number;
  totalAmountSpent: number;
  recommendedCars: Car[];
  availableCarsCount: number;
  isLoading: boolean;
  error: string | null;
}

export function useDashboardData(): DashboardData {
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalAmountSpent, setTotalAmountSpent] = useState(0);
  const [recommendedCars, setRecommendedCars] = useState<Car[]>([]);
  const [availableCarsCount, setAvailableCarsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [myBookingsData, carsData] = await Promise.allSettled([
          bookingApi.getMyBookings({ limit: 20 }),
          carApi.getCars({ limit: 8, sort: 'rating' }),
        ]);

        if (myBookingsData.status === 'fulfilled' && myBookingsData.value) {
          const bookings = myBookingsData.value.bookings || [];
          const now = new Date();

          const upcoming = bookings.filter((b) => {
            const start = new Date(b.startDate);
            return (
              (b.status === 'confirmed' || b.status === 'pending' || b.status === 'active') &&
              start >= now
            );
          });
          const recent = bookings.slice(0, 5);
          const spent = bookings
            .filter((b) => b.status === 'completed')
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

          setUpcomingBookings(upcoming);
          setRecentBookings(recent);
          setTotalBookings(myBookingsData.value.pagination?.total || bookings.length);
          setTotalAmountSpent(spent);
        }

        if (carsData.status === 'fulfilled' && carsData.value) {
          setRecommendedCars(carsData.value.cars || []);
          setAvailableCarsCount(carsData.value.pagination?.total || 0);
        }
      } catch {
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    upcomingBookings,
    recentBookings,
    totalBookings,
    totalAmountSpent,
    recommendedCars,
    availableCarsCount,
    isLoading,
    error,
  };
}
