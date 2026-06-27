'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { carApi } from '@/lib/api/carApi';
import { Car, CarFilters } from '@/types';

export function useCars(initialFilters: CarFilters = {}) {
  const [cars, setCars] = useState<Car[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 0 });
  const [filters, setFilters] = useState<CarFilters>({ page: 1, limit: 12, ...initialFilters });
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tracks whether the current useEffect fetch is a "load more" (append) operation.
  // When loadMore() fires, it updates this ref BEFORE updating filter state, so the
  // useEffect knows not to replace the list.
  const isAppendRef = useRef(false);

  // Tracks in-flight fetch to prevent duplicate concurrent requests.
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCars = useCallback(async (currentFilters: CarFilters, append: boolean) => {
    // Cancel any in-flight request before starting a new one.
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    if (!append) setIsLoading(true);
    else setIsFetchingMore(true);
    setError(null);

    try {
      const data = await carApi.getCars(currentFilters);

      setCars(prev => {
        if (!append) return data.cars;
        // Deduplicate by _id to prevent duplicate cards on re-renders.
        const existingIds = new Set(prev.map(c => c._id));
        const uniqueNewCars = data.cars.filter((c: Car) => !existingIds.has(c._id));
        return [...prev, ...uniqueNewCars];
      });
      setPagination(data.pagination);
    } catch (err: unknown) {
      // Don't set error state if the request was intentionally aborted.
      if ((err as { name?: string })?.name === 'CanceledError' || (err as { code?: string })?.code === 'ERR_CANCELED') {
        return;
      }
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(errorMsg || 'Failed to load cars');
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, []);

  // This effect ONLY handles filter changes (search, category, price, sort).
  // The isAppendRef flag prevents it from resetting the list when loadMore fires.
  useEffect(() => {
    const append = isAppendRef.current;
    isAppendRef.current = false; // Reset flag immediately after reading.
    void fetchCars(filters, append);

    return () => {
      // Abort the request if the component unmounts or filters change again.
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filters, fetchCars]);

  // Resets page to 1 and clears car list when filters change.
  const updateFilters = useCallback((newFilters: Partial<CarFilters>) => {
    isAppendRef.current = false; // Ensure next fetch replaces (not appends).
    setCars([]);
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  // Loads the next page and APPENDS results to the existing list.
  // FIX: Previously called both setFilters AND fetchCars directly, causing two
  // concurrent API calls — one with append=true, one with append=false — which
  // raced and the append=false call (from useEffect) would REPLACE the car list.
  // Now we set isAppendRef=true before setFilters so useEffect uses append mode.
  const loadMore = useCallback(() => {
    if (pagination.page >= pagination.totalPages || isFetchingMore || isLoading) return;

    isAppendRef.current = true; // Signal the upcoming useEffect to append.
    const nextPage = pagination.page + 1;
    setFilters(prev => ({ ...prev, page: nextPage }));
  }, [pagination.page, pagination.totalPages, isFetchingMore, isLoading]);

  return { cars, pagination, isLoading, isFetchingMore, error, filters, updateFilters, loadMore };
}
