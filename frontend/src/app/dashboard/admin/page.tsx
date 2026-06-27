'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IndianRupee, CalendarClock, Car, Users, LayoutDashboard,
  TrendingUp, CheckCircle, XCircle, Wrench, UserCheck, UserPlus,
  Clock, BarChart3, Activity
} from 'lucide-react';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { AdminCharts } from '@/components/admin/AdminCharts';
import { DataTable } from '@/components/admin/DataTable';
import { ActivityFeed } from '@/components/admin/ActivityFeed';

// ── Mock Data ────────────────────────────────────────────────────────────────

const REVENUE_STATS = [
  { title: "Today's Revenue", value: '₹28,500', change: 14.2, gradient: 'from-blue-500 to-indigo-600', icon: IndianRupee },
  { title: 'Monthly Revenue', value: '₹8,45,000', change: 22.1, gradient: 'from-violet-500 to-purple-600', icon: TrendingUp },
  { title: 'Annual Revenue', value: '₹68,20,000', change: 31.5, gradient: 'from-emerald-500 to-teal-600', icon: BarChart3 },
  { title: 'Pending Payments', value: '₹1,24,000', change: -8.3, gradient: 'from-amber-500 to-orange-600', icon: Clock },
];

const BOOKING_STATS = [
  { title: 'Total Bookings', value: '1,284', change: 12.5, gradient: 'from-blue-500 to-cyan-600', icon: CalendarClock },
  { title: 'Active Rentals', value: '128', change: 8.2, gradient: 'from-indigo-500 to-blue-600', icon: CheckCircle },
  { title: 'Completed', value: '1,041', change: 18.6, gradient: 'from-emerald-500 to-green-600', icon: CheckCircle },
  { title: 'Cancelled', value: '115', change: -5.1, gradient: 'from-red-500 to-rose-600', icon: XCircle },
];

const USER_STATS = [
  { title: 'Total Users', value: '2,845', change: 18.2, gradient: 'from-violet-500 to-purple-600', icon: Users },
  { title: 'New This Month', value: '342', change: 24.5, gradient: 'from-pink-500 to-rose-600', icon: UserPlus },
  { title: 'Active Users', value: '1,920', change: 9.8, gradient: 'from-blue-500 to-indigo-600', icon: UserCheck },
];

const FLEET_STATS = [
  { title: 'Total Cars', value: '68', change: 4.5, gradient: 'from-slate-500 to-slate-700', icon: Car },
  { title: 'Available', value: '32', change: -6.2, gradient: 'from-emerald-500 to-teal-600', icon: CheckCircle },
  { title: 'Rented Out', value: '29', change: 12.1, gradient: 'from-blue-500 to-indigo-600', icon: Car },
  { title: 'Maintenance', value: '7', change: 0, gradient: 'from-amber-500 to-orange-600', icon: Wrench },
];

const MOCK_BOOKINGS = [
  { _id: 'b1', user: 'John Doe', car: 'Tesla Model 3', status: 'confirmed', amount: '₹12,250', date: '2026-06-15' },
  { _id: 'b2', user: 'Jane Smith', car: 'BMW X5', status: 'completed', amount: '₹28,400', date: '2026-06-10' },
  { _id: 'b3', user: 'Alice Johnson', car: 'Audi A4', status: 'pending', amount: '₹9,500', date: '2026-06-18' },
  { _id: 'b4', user: 'Bob Brown', car: 'Mercedes C-Class', status: 'cancelled', amount: '₹0', date: '2026-06-08' },
  { _id: 'b5', user: 'Priya Sharma', car: 'Hyundai Creta', status: 'active', amount: '₹7,200', date: '2026-06-12' },
];

const MOCK_USERS = [
  { _id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active' },
  { _id: 'u2', name: 'Admin User', email: 'admin@rentease.com', role: 'admin', status: 'active' },
  { _id: 'u3', name: 'Alice Johnson', email: 'alice@example.com', role: 'user', status: 'suspended' },
  { _id: 'u4', name: 'Priya Sharma', email: 'priya@example.com', role: 'user', status: 'active' },
];

const MOCK_CARS = [
  { _id: 'c1', make: 'Tesla', model: 'Model 3', category: 'Electric', rate: '₹4,500/day', status: 'available' },
  { _id: 'c2', make: 'BMW', model: 'X5', category: 'SUV', rate: '₹8,500/day', status: 'maintenance' },
  { _id: 'c3', make: 'Audi', model: 'A4', category: 'Sedan', rate: '₹5,200/day', status: 'rented' },
  { _id: 'c4', make: 'Mercedes', model: 'C-Class', category: 'Luxury', rate: '₹9,200/day', status: 'available' },
];

// ── Tabs config ──────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',  label: 'Overview',  icon: LayoutDashboard },
  { id: 'bookings',  label: 'Bookings',  icon: CalendarClock },
  { id: 'fleet',     label: 'Fleet',     icon: Car },
  { id: 'users',     label: 'Users',     icon: Users },
  { id: 'activity',  label: 'Activity',  icon: Activity },
];

// ── Status badge renderer ────────────────────────────────────────────────────

function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    confirmed:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    completed:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    pending:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    cancelled:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    active:     'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    available:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    rented:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    maintenance:'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    admin:      'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    user:       'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    suspended:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${map[value] ?? 'bg-slate-100 text-slate-700'}`}>
      {value}
    </span>
  );
}

// ── Section Header ───────────────────────────────────────────────────────────

function SectionGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</h3>
      {children}
    </div>
  );
}

// ── Admin Dashboard Page ─────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-8 max-w-7xl">

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">Admin Panel</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Monitor bookings, revenue, fleet, and user activity in real time.</p>
        </div>
      </motion.div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl w-fit overflow-x-auto" role="tablist" aria-label="Admin sections">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                isActive
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="adminActiveTab"
                  className="absolute inset-0 bg-white dark:bg-slate-700 shadow-sm rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <tab.icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          role="tabpanel"
          aria-label={`${activeTab} content`}
        >

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <SectionGroup title="Revenue">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {REVENUE_STATS.map((stat, i) => (
                    <AdminStatCard key={stat.title} {...stat} delay={i * 0.07} />
                  ))}
                </div>
              </SectionGroup>

              <SectionGroup title="Booking Analytics">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {BOOKING_STATS.map((stat, i) => (
                    <AdminStatCard key={stat.title} {...stat} delay={i * 0.07} />
                  ))}
                </div>
              </SectionGroup>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SectionGroup title="User Statistics">
                  <div className="space-y-4">
                    {USER_STATS.map((stat, i) => (
                      <AdminStatCard key={stat.title} {...stat} delay={i * 0.07} />
                    ))}
                  </div>
                </SectionGroup>
                <div className="lg:col-span-2">
                  <SectionGroup title="Fleet Statistics">
                    <div className="grid grid-cols-2 gap-4">
                      {FLEET_STATS.map((stat, i) => (
                        <AdminStatCard key={stat.title} {...stat} delay={i * 0.07} />
                      ))}
                    </div>
                  </SectionGroup>
                </div>
              </div>

              {/* Charts */}
              <SectionGroup title="Charts & Trends">
                <AdminCharts />
              </SectionGroup>
            </div>
          )}

          {/* ── BOOKINGS ── */}
          {activeTab === 'bookings' && (
            <DataTable
              title="All Bookings"
              data={MOCK_BOOKINGS}
              searchKey="user"
              columns={[
                { key: '_id', header: 'Booking ID', render: (v) => <span className="text-slate-400 font-mono text-xs">#{String(v)}</span> },
                { key: 'user', header: 'Customer' },
                { key: 'car', header: 'Vehicle' },
                { key: 'date', header: 'Date' },
                { key: 'amount', header: 'Amount' },
                { key: 'status', header: 'Status', render: (v) => <StatusBadge value={String(v)} /> },
              ]}
            />
          )}

          {/* ── FLEET ── */}
          {activeTab === 'fleet' && (
            <DataTable
              title="Fleet Management"
              data={MOCK_CARS}
              searchKey="model"
              columns={[
                { key: '_id', header: 'ID', render: (v) => <span className="text-slate-400 font-mono text-xs">#{String(v)}</span> },
                { key: 'make', header: 'Make' },
                { key: 'model', header: 'Model' },
                { key: 'category', header: 'Category' },
                { key: 'rate', header: 'Daily Rate' },
                { key: 'status', header: 'Status', render: (v) => <StatusBadge value={String(v)} /> },
              ]}
            />
          )}

          {/* ── USERS ── */}
          {activeTab === 'users' && (
            <DataTable
              title="User Management"
              data={MOCK_USERS}
              searchKey="email"
              columns={[
                { key: '_id', header: 'ID', render: (v) => <span className="text-slate-400 font-mono text-xs">#{String(v)}</span> },
                { key: 'name', header: 'Name' },
                { key: 'email', header: 'Email' },
                { key: 'role', header: 'Role', render: (v) => <StatusBadge value={String(v)} /> },
                { key: 'status', header: 'Status', render: (v) => <StatusBadge value={String(v)} /> },
              ]}
            />
          )}

          {/* ── ACTIVITY ── */}
          {activeTab === 'activity' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Real-time system events and user actions</p>
              </div>
              <ActivityFeed />
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
