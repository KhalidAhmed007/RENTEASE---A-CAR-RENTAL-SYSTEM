'use client';

import { cn } from '@/lib/utils';
import { Zap, Car, Shield, Gem, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'All', icon: SlidersHorizontal },
  { value: 'sedan', label: 'Sedan', icon: Car },
  { value: 'suv', label: 'SUV', icon: Shield },
  { value: 'luxury', label: 'Luxury', icon: Gem },
  { value: 'electric', label: 'Electric', icon: Zap },
];

interface FilterPanelProps {
  selectedCategory: string;
  minPrice: string;
  maxPrice: string;
  onCategoryChange: (val: string) => void;
  onMinPriceChange: (val: string) => void;
  onMaxPriceChange: (val: string) => void;
}

export function FilterPanel({
  selectedCategory,
  minPrice,
  maxPrice,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
}: FilterPanelProps) {
  return (
    <aside className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Category</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onCategoryChange(value)}
              aria-pressed={selectedCategory === value}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                selectedCategory === value
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Daily Rate</h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">₹</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={e => onMinPriceChange(e.target.value)}
              min={0}
              aria-label="Minimum price"
              className="w-full pl-7 pr-2 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>
          <span className="text-slate-400 dark:text-slate-500 text-sm shrink-0">to</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">₹</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={e => onMaxPriceChange(e.target.value)}
              min={0}
              aria-label="Maximum price"
              className="w-full pl-7 pr-2 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
