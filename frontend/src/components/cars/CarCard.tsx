'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Star, Zap, Settings, Fuel, Users, Heart, ImageOff } from 'lucide-react';
import { Car } from '@/types';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';

// Local placeholder — used ONLY when a car has NO images array or empty array.
// If a car has images[0] we always attempt to show it first.
const PLACEHOLDER_URL = '/images/cars/placeholder-car.jpg';

const CATEGORY_STYLES: Record<string, string> = {
  sedan: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  suv: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  luxury: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  electric: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

interface CarCardProps {
  car: Car;
  index?: number;
}

export function CarCard({ car, index = 0 }: CarCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  // FIX: Track both loading state and error state.
  // imgError is ONLY set to true when the actual network request fails (onError).
  // It is NOT reset by re-renders because CarCard uses key={car._id} in parent,
  // which means this component instance is stable for the lifetime of that car.
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const isAvailable = car.status === 'available';

  // FIX: Determine the image source ONCE per car object.
  // Always derive from car.images[0] — never from a separate independent array.
  // Fall back to PLACEHOLDER only when the car has no images at all.
  const imageSrc = useMemo(() => {
    const firstImage = car.images?.[0];
    // Validate that the URL is a non-empty string before using it.
    if (firstImage && typeof firstImage === 'string' && firstImage.trim().length > 0) {
      return firstImage;
    }
    return PLACEHOLDER_URL;
  }, [car.images]);

  // FIX: Extract features using useMemo to prevent recalculation on every render.
  const { transmission, fuel, seats } = useMemo(() => {
    const features = car.features ?? [];
    const find = (...terms: string[]) =>
      features.find(f => terms.some(t => f.toLowerCase().includes(t))) ?? null;

    return {
      transmission: find('automatic', 'manual') ?? 'Automatic',
      fuel: find('diesel', 'petrol', 'electric', 'hybrid') ?? 'Petrol',
      seats: find('seater') ?? '5 Seater',
    };
  }, [car.features]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300 flex flex-col"
    >
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">

        {/* Loading shimmer — shown while image is fetching */}
        {imgLoading && !imgError && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse" />
        )}

        {/* FIX: Error fallback — only shown when the actual image URL fails to load.
            Never shows "NO IMAGE" for a car that has a valid URL in its data. */}
        {imgError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-2">
            <ImageOff className="h-10 w-10" strokeWidth={1.5} />
            <span className="text-xs font-semibold uppercase tracking-wider">Image Unavailable</span>
          </div>
        ) : (
          <Image
            src={imageSrc}
            alt={`${car.make} ${car.carModel} ${car.year}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              'object-cover transition-all duration-500 group-hover:scale-105',
              imgLoading ? 'opacity-0' : 'opacity-100',
            )}
            // FIX: onLoad clears the loading shimmer, revealing the real image.
            onLoad={() => setImgLoading(false)}
            // FIX: onError sets imgError=true, showing the professional fallback.
            // This is the ONLY path that triggers the "Image Unavailable" UI.
            onError={() => {
              setImgLoading(false);
              setImgError(true);
            }}
            // Priority for first visible cards (above the fold)
            priority={index < 3}
          />
        )}

        {/* Category badge */}
        <span className={cn(
          'absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold capitalize z-10',
          CATEGORY_STYLES[car.category] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
        )}>
          {car.category === 'electric' && <Zap className="inline h-3 w-3 mr-1" />}
          {car.category}
        </span>

        {/* Availability badge */}
        <span className={cn(
          'absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold z-10',
          isAvailable
            ? 'bg-green-500 text-white dark:bg-green-600'
            : 'bg-amber-400 text-amber-900 dark:bg-amber-500 dark:text-amber-950'
        )}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </span>

        {/* Wishlist Button */}
        <button
          onClick={(e) => { e.preventDefault(); setIsWishlisted(w => !w); }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 shadow-sm transition-colors z-10"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-600 dark:text-slate-400'}`} />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {car.make} {car.carModel}
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{car.year} &bull; {car.make}</p>
          </div>
          {car.reviewCount > 0 && (
            <div className="flex items-center gap-1 shrink-0 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">{car.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Location */}
        {car.location?.address && (
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-4 mt-2">
            <MapPin className="h-3.5 w-3.5 text-blue-500 shrink-0" />
            <span className="truncate">{car.location.address}</span>
          </div>
        )}

        {/* Specs Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-slate-800 mb-4 mt-auto">
          <div className="flex flex-col items-center justify-center gap-1">
            <Settings className="h-4 w-4 text-slate-400" />
            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 uppercase truncate w-full text-center">{transmission}</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 border-x border-slate-100 dark:border-slate-800">
            <Fuel className="h-4 w-4 text-slate-400" />
            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 uppercase truncate w-full text-center">{fuel}</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1">
            <Users className="h-4 w-4 text-slate-400" />
            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 uppercase truncate w-full text-center">{seats}</span>
          </div>
        </div>

        {/* Footer & Actions */}
        <div className="flex flex-col gap-3">
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">₹{car.dailyRate?.toLocaleString('en-IN')}</span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/day</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <Link
              href={`/cars/${car._id}`}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              View Details
            </Link>
            <Link
              href={`/dashboard/bookings/new?carId=${car._id}`}
              className={cn(
                'inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                isAvailable
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed pointer-events-none'
              )}
              aria-disabled={!isAvailable}
            >
              {isAvailable ? 'Book Now' : 'Unavailable'}
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
