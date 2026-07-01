import { Suspense } from 'react';
import { CarBrowser } from '@/components/cars/CarBrowser';
import { CarGridSkeleton } from '@/components/cars/CarCardSkeleton';

export const metadata = {
  title: 'Browse Cars | RentEase',
  description: 'Search and filter our wide selection of vehicles. Book the perfect car for your trip.',
};

export default function CarsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="h-9 w-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg mb-2" />
            <div className="h-4 w-36 bg-slate-100 dark:bg-slate-700 animate-pulse rounded" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CarGridSkeleton count={9} />
        </div>
      </div>
    }>
      <CarBrowser />
    </Suspense>
  );
}
