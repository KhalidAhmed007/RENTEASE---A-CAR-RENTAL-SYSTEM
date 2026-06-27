'use client';

import { motion } from 'framer-motion';
import { Tag, Clock, ArrowRight, Percent } from 'lucide-react';
import Link from 'next/link';

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: number;
  expiresIn: string;
  gradient: string;
  emoji: string;
  category: string;
}

const OFFERS: Offer[] = [
  {
    id: 'weekend-sale',
    title: 'Weekend Sale',
    description: 'Enjoy 20% off all weekend bookings. Perfect for short getaways.',
    discount: 20,
    expiresIn: '2 days',
    gradient: 'from-rose-500 to-pink-600',
    emoji: '🌅',
    category: 'sedan',
  },
  {
    id: 'suv-discount',
    title: 'SUV Special',
    description: 'Premium SUVs at a steal. Ideal for family trips & off-road adventures.',
    discount: 15,
    expiresIn: '5 days',
    gradient: 'from-emerald-500 to-teal-600',
    emoji: '🚙',
    category: 'suv',
  },
  {
    id: 'long-trip',
    title: 'Long Trip Package',
    description: 'Book for 7+ days and save big. Unlimited KMs included.',
    discount: 25,
    expiresIn: '10 days',
    gradient: 'from-blue-500 to-indigo-600',
    emoji: '🛣️',
    category: '',
  },
  {
    id: 'festival-offer',
    title: 'Festival Special',
    description: 'Celebrate in style. Festival season discounts on luxury fleet.',
    discount: 30,
    expiresIn: '3 days',
    gradient: 'from-amber-500 to-orange-600',
    emoji: '🎉',
    category: 'luxury',
  },
];

function OfferCard({ offer, index }: { offer: Offer; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${offer.gradient} p-6 text-white shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer`}
      role="article"
      aria-label={`${offer.title}: ${offer.discount}% off`}
    >
      {/* Decorative blob */}
      <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-black/10 blur-2xl" />

      <div className="relative">
        {/* Discount badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-bold mb-3">
          <Percent className="h-3 w-3" />
          {offer.discount}% OFF
        </div>

        <div className="text-3xl mb-2">{offer.emoji}</div>

        <h4 className="text-lg font-bold text-white mb-1">{offer.title}</h4>
        <p className="text-sm text-white/80 leading-relaxed mb-4">{offer.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-white/70">
            <Clock className="h-3.5 w-3.5" />
            Expires in {offer.expiresIn}
          </div>
          <Link
            href={offer.category ? `/cars?category=${offer.category}` : '/cars'}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-white transition-colors"
            aria-label={`Claim ${offer.title} offer`}
          >
            Claim <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function SpecialOffers() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="list" aria-label="Special offers">
      {OFFERS.map((offer, i) => (
        <div key={offer.id} role="listitem">
          <OfferCard offer={offer} index={i} />
        </div>
      ))}
    </div>
  );
}

export function SpecialOffersEmpty() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 text-center">
      <Tag className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        No active offers right now. Check back soon!
      </p>
    </div>
  );
}
