import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Star, ArrowLeft, Shield, ChevronRight, Settings, Fuel, Users, Gauge, Wind, Briefcase, CheckCircle2 } from 'lucide-react';
import { Car } from '@/types';

// Server Component fetch URL:
// - INTERNAL_API_URL   → set this on Vercel/Render for production (e.g. https://api.yourdomain.com/api/v1)
// - Falls back to the local backend in development (never use NEXT_PUBLIC_API_URL here —
//   it is '/api/v1', a relative path that Node.js fetch cannot resolve without a host)
const BASE_URL = process.env.INTERNAL_API_URL || 'http://localhost:5000/api/v1';
const PLACEHOLDER = '/images/cars/placeholder-car.jpg';

async function getCar(id: string): Promise<Car | null> {
  try {
    const res = await fetch(`${BASE_URL}/cars/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const car = await getCar(resolvedParams.id);
  if (!car) return { title: 'Car Not Found' };
  return {
    title: `${car.make} ${car.carModel} (${car.year}) | RentEase`,
    description: `Rent the ${car.make} ${car.carModel} for ₹${car.dailyRate?.toLocaleString('en-IN')}/day. ${car.location?.address || ''}`,
  };
}

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const car = await getCar(resolvedParams.id);
  if (!car) notFound();

  const isAvailable = car.status === 'available';

  // Feature extraction
  const getFeature = (type: string) => {
    if (!car.features) return null;
    return car.features.find(f => f.toLowerCase().includes(type));
  };
  const transmission = getFeature('automatic') || getFeature('manual') || 'Automatic';
  const fuel = getFeature('diesel') || getFeature('petrol') || getFeature('electric') || getFeature('hybrid') || 'Petrol';
  const seats = getFeature('seater') || '5 Seats';
  const mileage = getFeature('kmpl') || getFeature('range') || '15 kmpl';
  const hasAc = getFeature('ac') || getFeature('air condition') ? 'Yes' : 'No';
  const luggage = getFeature('bag') || getFeature('luggage') || '2 Bags';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 pb-20">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/cars" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Browse Cars</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-900 dark:text-white font-medium">{car.make} {car.carModel}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/cars" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>

        {/* Hero Section: Gallery & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Gallery */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-sm">
              <Image
                src={car.images?.[0] || PLACEHOLDER}
                alt={`${car.make} ${car.carModel}`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </div>
            {car.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {car.images.slice(1, 5).map((img, i) => (
                  // FIX: key={img} uses the URL as stable key instead of array index
                  <div key={img} className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer hover:opacity-90 transition-opacity border border-slate-200 dark:border-slate-700">
                    <Image src={img} alt={`${car.make} ${car.carModel} view ${i + 2}`} fill className="object-cover" sizes="25vw" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking Summary Card */}
          <div className="lg:col-span-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-slate-950/40 p-6 lg:p-8 lg:sticky lg:top-24">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                  {car.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isAvailable ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                  {isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight mb-2">
                {car.make} {car.carModel}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <p className="text-base text-slate-500 dark:text-slate-400 font-medium">{car.year}</p>
                {car.reviewCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-900 dark:text-white">{car.averageRating.toFixed(1)}</span>
                    <span className="text-slate-500 dark:text-slate-400 underline cursor-pointer hover:text-slate-900 dark:hover:text-white">({car.reviewCount} reviews)</span>
                  </div>
                )}
              </div>

              <div className="py-6 border-y border-slate-100 dark:border-slate-800 mb-6 flex items-end gap-2">
                <span className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">₹{car.dailyRate?.toLocaleString('en-IN')}</span>
                <span className="text-lg font-medium text-slate-500 dark:text-slate-400 mb-1.5">/ day</span>
              </div>

              <Link
                href={`/dashboard/bookings/new?carId=${car._id}`}
                className={`w-full flex items-center justify-center py-4 rounded-xl text-base font-bold transition-all ${
                  isAvailable
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 pointer-events-none'
                }`}
                aria-disabled={!isAvailable}
              >
                {isAvailable ? 'Book This Car Now' : 'Currently Unavailable'}
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Free cancellation up to 48 hours
              </div>
            </div>
          </div>
        </div>

        {/* Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            
            {/* Specifications Section */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Car Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { icon: Settings, label: 'Transmission', value: transmission },
                  { icon: Fuel, label: 'Fuel Type', value: fuel },
                  { icon: Users, label: 'Seats', value: seats },
                  { icon: Gauge, label: 'Mileage', value: mileage },
                  { icon: Wind, label: 'Air Conditioning', value: hasAc },
                  { icon: Briefcase, label: 'Luggage', value: luggage },
                ].map((spec) => (
                  // FIX: key={spec.label} is stable — does not depend on array position
                  <div key={spec.label} className="flex flex-col gap-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <spec.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{spec.label}</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white capitalize">{spec.value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Description Section */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Description</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                  Experience the thrill of driving the {car.make} {car.carModel}. This {car.category} model from {car.year} offers unmatched performance, comfort, and reliability. Whether you're planning a weekend getaway or need a dependable ride for business, the {car.carModel} is equipped with the latest features to ensure a smooth and safe journey.
                </p>
                {car.features?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Premium Features</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {car.features.map(f => (
                        <li key={f} className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                          <Shield className="h-5 w-5 text-emerald-500 shrink-0" />
                          <span className="font-medium">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            {/* Location Section */}
            {car.location?.address && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Pickup Location</h2>
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-start gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                    <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Rental Hub</h4>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{car.location.address}</p>
                    <button className="mt-3 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">
                      View on Map &rarr;
                    </button>
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
