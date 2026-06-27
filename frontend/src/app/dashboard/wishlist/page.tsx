'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Car, Star, MapPin, Trash2, ArrowRight,
  Fuel, Users, Gauge, SparklesIcon, Filter
} from 'lucide-react';

// ─── Static wishlist data (frontend-only feature) ──────────────────────────────
const WISHLIST_ITEMS = [
  {
    id: '1',
    make: 'BMW',
    carModel: '5 Series',
    year: 2023,
    category: 'luxury',
    dailyRate: 4500,
    rating: 4.9,
    reviewCount: 128,
    fuel: 'Petrol',
    seats: 5,
    transmission: 'Automatic',
    location: 'Connaught Place, Delhi',
    image: '/images/cars/bmw-5-series.jpg',
    savedOn: '2026-06-20',
    available: true,
  },
  {
    id: '2',
    make: 'Toyota',
    carModel: 'Fortuner',
    year: 2022,
    category: 'suv',
    dailyRate: 3200,
    rating: 4.7,
    reviewCount: 89,
    fuel: 'Diesel',
    seats: 7,
    transmission: 'Automatic',
    location: 'Cyber City, Gurgaon',
    image: '/images/cars/toyota-fortuner.jpg',
    savedOn: '2026-06-18',
    available: true,
  },
  {
    id: '3',
    make: 'Mercedes',
    carModel: 'GLC',
    year: 2023,
    category: 'luxury',
    dailyRate: 6000,
    rating: 4.8,
    reviewCount: 64,
    fuel: 'Petrol',
    seats: 5,
    transmission: 'Automatic',
    location: 'Bandra, Mumbai',
    image: '/images/cars/mercedes-glc.jpg',
    savedOn: '2026-06-15',
    available: false,
  },
  {
    id: '4',
    make: 'Honda',
    carModel: 'City',
    year: 2023,
    category: 'sedan',
    dailyRate: 1800,
    rating: 4.6,
    reviewCount: 215,
    fuel: 'Petrol',
    seats: 5,
    transmission: 'Automatic',
    location: 'Koramangala, Bengaluru',
    image: '/images/cars/honda-city.jpg',
    savedOn: '2026-06-10',
    available: true,
  },
];

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Luxury', 'Hatchback'];

// ─── Wishlist Card ──────────────────────────────────────────────────────────────
function WishlistCard({
  item,
  onRemove,
}: {
  item: typeof WISHLIST_ITEMS[0];
  onRemove: (id: string) => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {!imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={`${item.make} ${item.carModel}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="h-16 w-16 text-slate-300 dark:text-slate-600" />
          </div>
        )}

        {/* Availability badge */}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold ${
          item.available
            ? 'bg-emerald-500 text-white'
            : 'bg-slate-500 text-white'
        }`}>
          {item.available ? 'Available' : 'Unavailable'}
        </span>

        {/* Category pill */}
        <span className="absolute top-3 right-3 px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full capitalize">
          {item.category}
        </span>

        {/* Remove button */}
        <button
          onClick={() => onRemove(item.id)}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-md opacity-0 group-hover:opacity-100"
          aria-label="Remove from wishlist"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {item.make} {item.carModel}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.year}</p>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-lg shrink-0">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{item.rating}</span>
            <span className="text-xs text-slate-400">({item.reviewCount})</span>
          </div>
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-3 mb-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5" />{item.fuel}</span>
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{item.seats} seats</span>
          <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" />{item.transmission}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1">{item.location}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Per day</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">
              ₹{item.dailyRate.toLocaleString('en-IN')}
            </p>
          </div>
          {item.available ? (
            <Link
              href={`/cars`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              Book Now <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-semibold rounded-xl">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────
export default function WishlistPage() {
  const [items, setItems] = useState(WISHLIST_ITEMS);
  const [activeCategory, setActiveCategory] = useState('All');

  const handleRemove = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const filtered = activeCategory === 'All'
    ? items
    : items.filter(i => i.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="space-y-8 max-w-7xl pb-16">

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-600 to-red-700 p-8 shadow-xl shadow-rose-200 dark:shadow-rose-950/50">
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 -left-8 w-48 h-48 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Heart className="h-4 w-4 text-white fill-white" />
              </div>
              <span className="text-pink-200 text-sm font-medium">Saved Cars</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">My Wishlist</h1>
            <p className="mt-2 text-pink-200 text-sm max-w-md">
              Cars you&apos;ve saved for later. Book them before they&apos;re gone!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-3 text-white">
              <Heart className="h-5 w-5 fill-white/80" />
              <div>
                <p className="text-xl font-bold leading-none">{items.length}</p>
                <p className="text-xs text-pink-200 mt-0.5">Saved cars</p>
              </div>
            </div>
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-rose-600 font-bold text-sm rounded-xl hover:bg-rose-50 transition-colors shadow-sm"
            >
              <SparklesIcon className="h-4 w-4" />
              Browse More
            </Link>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      {items.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-slate-400" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/30'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid or Empty State */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 && items.length > 0 ? (
          <motion.div
            key="no-filtered"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800"
          >
            <p className="text-4xl mb-3">🔍</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No {activeCategory} cars saved</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Try a different category filter.</p>
          </motion.div>
        ) : items.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800"
          >
            <div className="mx-auto mb-5 w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-950/50 dark:to-pink-900/30 flex items-center justify-center">
              <Heart className="h-10 w-10 text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your wishlist is empty</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto text-sm">
              Browse our fleet and tap the heart icon to save your favorite cars.
            </p>
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
            >
              Browse Cars <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filtered.map(item => (
                <WishlistCard key={item.id} item={item} onRemove={handleRemove} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer CTA */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/30">
          <div>
            <p className="font-bold text-slate-900 dark:text-white">Ready to make a booking?</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Check availability and confirm your ride.</p>
          </div>
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm shrink-0"
          >
            View All Cars <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
