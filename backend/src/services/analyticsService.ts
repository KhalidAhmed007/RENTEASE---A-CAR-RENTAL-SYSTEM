import { prisma } from '../config/prisma';
import dayjs from 'dayjs';

export const analyticsService = {
  // ─── 1. Core KPIs ─────────────────────────────────────────────────────────
  async getDashboardKPIs() {
    const startOfMonth = dayjs().startOf('month').toDate();

    const [bookingStats, thisMonthStats, userCount, carCount] = await Promise.all([
      // All-time revenue & bookings
      prisma.booking.aggregate({
        where: { status: { in: ['confirmed', 'active', 'completed'] } },
        _sum:   { totalAmount: true },
        _count: { id: true },
      }),
      // This-month revenue
      prisma.booking.aggregate({
        where: {
          status:    { in: ['confirmed', 'active', 'completed'] },
          createdAt: { gte: startOfMonth },
        },
        _sum: { totalAmount: true },
      }),
      prisma.user.count({ where: { status: 'active' } }),
      prisma.car.count({ where: { status: { not: 'retired' } } }),
    ]);

    return {
      totalRevenue:     Number(bookingStats._sum.totalAmount ?? 0),
      thisMonthRevenue: Number(thisMonthStats._sum.totalAmount ?? 0),
      totalBookings:    bookingStats._count.id,
      activeUsers:      userCount,
      totalCars:        carCount,
    };
  },

  // ─── 2. Monthly Revenue Chart ─────────────────────────────────────────────
  async getMonthlyRevenueChart(year: number = dayjs().year()) {
    const startDate = dayjs().year(year).startOf('year').toDate();
    const endDate   = dayjs().year(year).endOf('year').toDate();

    // Fetch all qualifying bookings within the year
    const bookings = await prisma.booking.findMany({
      where: {
        status:    { in: ['confirmed', 'completed'] },
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { totalAmount: true, createdAt: true },
    });

    // Aggregate by month in-memory (avoids raw SQL for portability)
    const monthMap: Record<number, { revenue: number; bookings: number }> = {};
    for (let i = 1; i <= 12; i++) monthMap[i] = { revenue: 0, bookings: 0 };

    for (const b of bookings) {
      const month = dayjs(b.createdAt).month() + 1; // 1-indexed
      monthMap[month].revenue  += Number(b.totalAmount);
      monthMap[month].bookings += 1;
    }

    return Array.from({ length: 12 }, (_, i) => ({
      month:    dayjs().month(i).format('MMM'),
      revenue:  monthMap[i + 1].revenue,
      bookings: monthMap[i + 1].bookings,
    }));
  },

  // ─── 3. Car Utilization by Category ──────────────────────────────────────
  async getCarUtilization() {
    // Use groupBy to aggregate booking stats per car category
    const grouped = await prisma.booking.groupBy({
      by: ['carId'],
      where: { status: { in: ['confirmed', 'active', 'completed'] } },
      _sum:   { totalDays: true, totalAmount: true },
    });

    // Fetch all car categories in one query (avoid N+1)
    const carIds    = grouped.map((g) => g.carId);
    const cars      = await prisma.car.findMany({
      where:  { id: { in: carIds } },
      select: { id: true, category: true },
    });
    const carMap = new Map(cars.map((c) => [c.id, c.category]));

    // Aggregate by category
    const categoryMap: Record<string, { totalBookedDays: number; revenueGenerated: number }> = {};
    for (const g of grouped) {
      const cat = carMap.get(g.carId) ?? 'unknown';
      if (!categoryMap[cat]) categoryMap[cat] = { totalBookedDays: 0, revenueGenerated: 0 };
      categoryMap[cat].totalBookedDays  += g._sum.totalDays    ?? 0;
      categoryMap[cat].revenueGenerated += Number(g._sum.totalAmount ?? 0);
    }

    return Object.entries(categoryMap)
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.revenueGenerated - a.revenueGenerated);
  },
};
