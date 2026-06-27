'use client';

import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 42000, bookings: 24 },
  { month: 'Feb', revenue: 35000, bookings: 18 },
  { month: 'Mar', revenue: 58000, bookings: 35 },
  { month: 'Apr', revenue: 47000, bookings: 28 },
  { month: 'May', revenue: 63000, bookings: 42 },
  { month: 'Jun', revenue: 78000, bookings: 50 },
  { month: 'Jul', revenue: 85000, bookings: 55 },
  { month: 'Aug', revenue: 92000, bookings: 62 },
];

const userGrowthData = [
  { month: 'Jan', users: 120 },
  { month: 'Feb', users: 180 },
  { month: 'Mar', users: 250 },
  { month: 'Apr', users: 310 },
  { month: 'May', users: 420 },
  { month: 'Jun', users: 530 },
  { month: 'Jul', users: 680 },
  { month: 'Aug', users: 845 },
];

const carUtilData = [
  { category: 'Sedan', available: 12, rented: 8, maintenance: 2 },
  { category: 'SUV', available: 8, rented: 10, maintenance: 1 },
  { category: 'Luxury', available: 5, rented: 6, maintenance: 2 },
  { category: 'Electric', available: 7, rented: 4, maintenance: 1 },
];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'var(--tooltip-bg, #1e293b)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '12px',
    padding: '10px 14px',
  },
  itemStyle: { color: '#94a3b8' },
  labelStyle: { color: '#fff', fontWeight: 700 },
};

function ChartCard({ title, subtitle, children, delay = 0 }: {
  title: string; subtitle?: string; children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
    >
      <div className="mb-5">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

export function AdminCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Trend */}
      <ChartCard title="Revenue Trend" subtitle="Monthly revenue overview (₹)" delay={0.1}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-700" opacity={0.5} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle} formatter={(v: unknown) => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#adminRevGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Booking Trend */}
      <ChartCard title="Booking Trend" subtitle="Monthly bookings count" delay={0.15}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} formatter={(v: unknown) => [Number(v), 'Bookings']} />
              <Bar dataKey="bookings" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* User Growth */}
      <ChartCard title="User Growth" subtitle="Cumulative registered users" delay={0.2}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userGrowthData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} formatter={(v: unknown) => [Number(v), 'Users']} />
              <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', strokeWidth: 0, r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Car Utilization */}
      <ChartCard title="Fleet Utilization" subtitle="Available vs rented vs maintenance" delay={0.25}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={carUtilData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#94a3b8' }} />
              <Bar dataKey="available" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="rented" fill="#3b82f6" radius={[0, 0, 0, 0]} stackId="a" />
              <Bar dataKey="maintenance" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
