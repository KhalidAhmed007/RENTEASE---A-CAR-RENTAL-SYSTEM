'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface UserStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number; // positive = up, negative = down
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  delay?: number;
}

export function UserStatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconBg,
  iconColor,
  delay = 0,
}: UserStatCardProps) {
  const hasTrend = trend !== undefined;
  const isPositive = (trend ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-default overflow-hidden"
      role="article"
      aria-label={`${title}: ${value}`}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-transparent to-slate-50/50 dark:to-slate-800/30 rounded-2xl" />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          )}
        </div>

        {hasTrend && (
          <div
            className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? '+' : ''}{trend}% vs last month
          </div>
        )}

        {/* Sparkline placeholder */}
        <div className="mt-4 h-8 flex items-end gap-0.5" aria-hidden="true">
          {[35, 55, 40, 65, 50, 75, 60, 80, 70, 90].map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className={`flex-1 rounded-sm opacity-30 group-hover:opacity-60 transition-opacity duration-300 ${iconBg.replace('bg-', 'bg-').replace('-50', '-300').replace('-900/30', '-600')}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
