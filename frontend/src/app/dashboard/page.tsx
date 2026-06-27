'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useDashboardData } from '@/hooks/useDashboardData';
import { HeroBanner } from '@/components/dashboard/HeroBanner';
import { UserStatCard } from '@/components/dashboard/UserStatCard';
import { UpcomingBookingCard, UpcomingBookingEmpty } from '@/components/dashboard/UpcomingBooking';
import { RecommendedCars } from '@/components/dashboard/RecommendedCars';
import { SpecialOffers } from '@/components/dashboard/SpecialOffers';
import { RecentBookings } from '@/components/dashboard/RecentBookings';
import { NotificationsCenter } from '@/components/dashboard/NotificationsCenter';
import {
  HeroBannerSkeleton, StatCardSkeleton, BookingCardSkeleton,
  CarCardSkeleton, TableRowSkeleton, AnimatedSection
} from '@/components/ui/Skeleton';
import {
  CalendarClock, IndianRupee, Star, BookOpen, AlertTriangle
} from 'lucide-react';

// ── Section wrapper ──────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
      {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function DashboardCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

// ── Error state ──────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 dark:text-red-400">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

// ── Main Dashboard Page ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore();
  const {
    upcomingBookings,
    recentBookings,
    totalBookings,
    totalAmountSpent,
    recommendedCars,
    availableCarsCount,
    isLoading,
    error,
  } = useDashboardData();

  if (!user) return null;

  const activeBookingsCount = upcomingBookings.filter(
    (b) => b.status === 'active' || b.status === 'confirmed'
  ).length;

  const upcomingBooking = upcomingBookings[0] ?? null;

  return (
    <div className="space-y-8 max-w-7xl">

      {/* 1. HERO BANNER */}
      {isLoading ? (
        <HeroBannerSkeleton />
      ) : (
        <HeroBanner
          user={user}
          availableCarsCount={availableCarsCount}
          activeBookingsCount={activeBookingsCount}
          recommendedCount={recommendedCars.length}
        />
      )}

      {/* Error banner */}
      {error && <ErrorBanner message={error} />}

      {/* 2. STATS CARDS */}
      <AnimatedSection delay={0.1}>
        <SectionHeader title="Your Overview" subtitle="Key metrics at a glance" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <UserStatCard
                title="Total Bookings"
                value={totalBookings}
                subtitle="Lifetime rentals"
                trend={12}
                icon={BookOpen}
                iconBg="bg-blue-50 dark:bg-blue-950/50"
                iconColor="text-blue-600 dark:text-blue-400"
                delay={0}
              />
              <UserStatCard
                title="Upcoming Trips"
                value={upcomingBookings.length}
                subtitle={upcomingBookings.length === 1 ? '1 trip scheduled' : `${upcomingBookings.length} trips scheduled`}
                icon={CalendarClock}
                iconBg="bg-violet-50 dark:bg-violet-950/50"
                iconColor="text-violet-600 dark:text-violet-400"
                delay={0.08}
              />
              <UserStatCard
                title="Amount Spent"
                value={`₹${totalAmountSpent.toLocaleString()}`}
                subtitle="On completed trips"
                trend={8}
                icon={IndianRupee}
                iconBg="bg-emerald-50 dark:bg-emerald-950/50"
                iconColor="text-emerald-600 dark:text-emerald-400"
                delay={0.16}
              />
              <UserStatCard
                title="Avg. Rating"
                value="4.8"
                subtitle="Based on your reviews"
                trend={3}
                icon={Star}
                iconBg="bg-amber-50 dark:bg-amber-950/50"
                iconColor="text-amber-600 dark:text-amber-400"
                delay={0.24}
              />
            </>
          )}
        </div>
      </AnimatedSection>

      {/* 3. UPCOMING BOOKING + NOTIFICATIONS — two-column */}
      <AnimatedSection delay={0.2} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming booking (wide) */}
        <div className="lg:col-span-2">
          <SectionHeader
            title="Upcoming Trip"
            subtitle="Your next scheduled rental"
          />
          {isLoading ? (
            <BookingCardSkeleton />
          ) : upcomingBooking ? (
            <UpcomingBookingCard booking={upcomingBooking} />
          ) : (
            <UpcomingBookingEmpty />
          )}
        </div>

        {/* Notifications */}
        <div id="notifications">
          <SectionHeader title="Notifications" subtitle="Stay up to date" />
          <DashboardCard>
            <NotificationsCenter />
          </DashboardCard>
        </div>
      </AnimatedSection>

      {/* 4. RECOMMENDED CARS */}
      <AnimatedSection delay={0.3}>
        <SectionHeader
          title="Recommended For You"
          subtitle="Top-rated cars handpicked for your next trip"
        />
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => <CarCardSkeleton key={i} />)}
          </div>
        ) : (
          <RecommendedCars cars={recommendedCars} />
        )}
      </AnimatedSection>

      {/* 5. SPECIAL OFFERS */}
      <AnimatedSection delay={0.35}>
        <SectionHeader
          title="Special Offers"
          subtitle="Limited-time deals curated just for you"
        />
        <SpecialOffers />
      </AnimatedSection>

      {/* 6. RECENT BOOKINGS */}
      <AnimatedSection delay={0.4}>
        <DashboardCard>
          <SectionHeader
            title="Recent Bookings"
            subtitle="Your booking history"
          />
          {isLoading ? (
            <div className="space-y-1">
              {Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} />)}
            </div>
          ) : (
            <RecentBookings bookings={recentBookings} />
          )}
        </DashboardCard>
      </AnimatedSection>
    </div>
  );
}
