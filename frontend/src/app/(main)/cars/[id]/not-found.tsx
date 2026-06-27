import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CarNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-7xl mb-6">🚗</p>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Car Not Found</h1>
        <p className="text-slate-500 mb-8">This vehicle doesn&apos;t exist or may have been removed from our fleet.</p>
        <Link href="/cars" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Browse Available Cars
        </Link>
      </div>
    </div>
  );
}
