'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  gradient: string;
  delay?: number;
}

export function AdminStatCard({ title, value, change, icon: Icon, gradient, delay = 0 }: AdminStatCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {/* Gradient top accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />

      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>

      <p className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">{value}</p>

      {change !== undefined && (
        <div className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
          isPositive
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {isPositive ? '+' : ''}{change}% vs last month
        </div>
      )}
    </motion.div>
  );
}
