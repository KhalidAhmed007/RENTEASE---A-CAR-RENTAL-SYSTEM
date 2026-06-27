import { CarGridSkeleton } from '@/components/cars/CarCardSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="h-9 w-48 bg-slate-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-36 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="hidden lg:block w-64 h-80 bg-white rounded-2xl border border-slate-100 animate-pulse shrink-0" />
          <div className="flex-1">
            <div className="flex gap-3 mb-6">
              <div className="flex-1 h-11 bg-white border border-slate-200 rounded-xl animate-pulse" />
              <div className="w-48 h-11 bg-white border border-slate-200 rounded-xl animate-pulse" />
            </div>
            <CarGridSkeleton count={9} />
          </div>
        </div>
      </div>
    </div>
  );
}
