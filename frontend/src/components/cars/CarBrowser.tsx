'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useCars } from '@/hooks/useCars';
import { CarFilters } from '@/types';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { CarCard } from '@/components/cars/CarCard';
import { CarGridSkeleton } from '@/components/cars/CarCardSkeleton';
import { SearchBar } from '@/components/cars/SearchBar';
import { FilterPanel } from '@/components/cars/FilterPanel';
import { SortSelect } from '@/components/cars/SortSelect';
import { useSearchParams } from 'next/navigation';

export function CarBrowser() {
  const searchParams = useSearchParams();
  
  // Read initial search query and filters from the URL
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);

  const { cars, pagination, isLoading, isFetchingMore, error, updateFilters, loadMore } = useCars({
    limit: 12,
    sort: 'newest',
    search: initialSearch || undefined,
    category: initialCategory || undefined,
    minPrice: initialMinPrice ? Number(initialMinPrice) : undefined,
    maxPrice: initialMaxPrice ? Number(initialMaxPrice) : undefined,
  });

  // Sync state if search query parameter in URL changes
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const categoryParam = searchParams.get('category') || '';
    const minPriceParam = searchParams.get('minPrice') || '';
    const maxPriceParam = searchParams.get('maxPrice') || '';

    setSearchInput(search);
    setCategory(categoryParam);
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);

    updateFilters({
      search: search || undefined,
      category: categoryParam || undefined,
      minPrice: minPriceParam ? Number(minPriceParam) : undefined,
      maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
    });
  }, [searchParams, updateFilters]);

  const handleSearchChange = useCallback((val: string) => {
    setSearchInput(val);
    updateFilters({ search: val || undefined });
  }, [updateFilters]);

  const handleCategoryChange = useCallback((val: string) => {
    setCategory(val);
    updateFilters({ category: val || undefined });
  }, [updateFilters]);

  const handleSortChange = useCallback((val: string) => {
    setSort(val);
    updateFilters({ sort: val as CarFilters['sort'] });
  }, [updateFilters]);

  const handleMinPrice = useCallback((val: string) => {
    setMinPrice(val);
    updateFilters({ minPrice: val ? Number(val) : undefined });
  }, [updateFilters]);

  const handleMaxPrice = useCallback((val: string) => {
    setMaxPrice(val);
    updateFilters({ maxPrice: val ? Number(val) : undefined });
  }, [updateFilters]);

  // Infinite scroll sentinel — only active when there are more pages to load.
  const canLoadMore = !isLoading && !isFetchingMore && pagination.page < pagination.totalPages;
  const sentinelRef = useIntersectionObserver(loadMore, canLoadMore);

  // Stable car count label
  const vehicleCountLabel = useMemo(() => {
    if (isLoading) return 'Loading vehicles...';
    const total = pagination.total;
    return `${total} vehicle${total !== 1 ? 's' : ''} available`;
  }, [isLoading, pagination.total]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Browse Cars</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">{vehicleCountLabel}</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filters */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 lg:sticky lg:top-6 transition-colors duration-300">
              <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-5">Filters</h2>
              <FilterPanel
                selectedCategory={category}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onCategoryChange={handleCategoryChange}
                onMinPriceChange={handleMinPrice}
                onMaxPriceChange={handleMaxPrice}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Search & Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <SearchBar
                value={searchInput}
                onChange={handleSearchChange}
                className="flex-1"
              />
              <SortSelect value={sort} onChange={handleSortChange} />
            </div>

            {/* Error State */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 mb-6">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {isLoading ? (
              <CarGridSkeleton count={9} />
            ) : cars.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24"
              >
                <p className="text-5xl mb-4">🚗</p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No cars found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your filters or search query.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {cars.map((car, i) => (
                  <CarCard key={car._id} car={car} index={i} />
                ))}
              </div>
            )}

            {/* Infinite Scroll Sentinel */}
            <div ref={sentinelRef} className="h-8 mt-6 flex items-center justify-center">
              {isFetchingMore && (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading more...</span>
                </div>
              )}
              {!isFetchingMore && !isLoading && cars.length > 0 && pagination.page >= pagination.totalPages && (
                <p className="text-xs text-slate-400 dark:text-slate-500">You&apos;ve seen all available cars.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
