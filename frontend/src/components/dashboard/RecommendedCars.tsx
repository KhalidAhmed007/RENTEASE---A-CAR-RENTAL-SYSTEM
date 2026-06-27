'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ChevronLeft, ChevronRight, Car, ArrowRight, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Car as CarType } from '@/types';

interface RecommendedCarsProps {
  cars: CarType[];
}

const CATEGORY_COLORS: Record<string, string> = {
  sedan: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  suv: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  luxury: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  electric: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
};

function CarCardPlaceholder({ make, category }: { make: string; category: string }) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
      <div className="text-center p-4">
        {category === 'electric' ? (
          <Zap className="h-8 w-8 text-violet-300 dark:text-violet-500 mx-auto mb-1" />
        ) : (
          <Car className="h-8 w-8 text-slate-300 dark:text-slate-500 mx-auto mb-1" />
        )}
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{make}</p>
      </div>
    </div>
  );
}

function RecommendedCarCard({ car, index }: { car: CarType; index: number }) {
  const hasImage = car.images && car.images.length > 0;
  const catClass = CATEGORY_COLORS[car.category] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="group relative flex-shrink-0 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
      role="article"
      aria-label={`${car.make} ${car.carModel}`}
    >
      {/* Image */}
      <div className="relative h-40 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {hasImage ? (
          <Image
            src={car.images[0]}
            alt={`${car.make} ${car.carModel}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 256px"
          />
        ) : (
          <CarCardPlaceholder make={car.make} category={car.category} />
        )}

        {/* Wishlist button */}
        <button
          className="absolute top-3 right-3 rounded-full bg-white/90 dark:bg-slate-900/90 p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-rose-500 dark:hover:text-rose-400 focus-visible:opacity-100"
          aria-label={`Add ${car.make} ${car.carModel} to wishlist`}
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Category badge */}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize ${catClass}`}>
          {car.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
          {car.make} {car.carModel}
        </h4>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{car.year}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {car.averageRating?.toFixed(1) ?? '4.5'}
          </span>
          <span className="text-xs text-slate-400">({car.reviewCount ?? 0})</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">per day</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">
              ₹{car.dailyRate?.toLocaleString()}
            </p>
          </div>
          <Link
            href={`/cars/${car._id}`}
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            aria-label={`Book ${car.make} ${car.carModel}`}
          >
            Book Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function RecommendedCars({ cars }: RecommendedCarsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 280 : -280, behavior: 'smooth' });
  };

  if (cars.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 text-center">
        <Car className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No recommendations available right now.</p>
        <Link
          href="/cars"
          className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-blue-600 hover:underline"
        >
          Browse all cars <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Scroll buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        role="list"
        aria-label="Recommended cars carousel"
      >
        {cars.map((car, i) => (
          <div key={car._id} className="snap-start" role="listitem">
            <RecommendedCarCard car={car} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
