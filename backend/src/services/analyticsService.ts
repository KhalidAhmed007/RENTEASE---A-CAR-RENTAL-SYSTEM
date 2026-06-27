import Booking from '../models/Booking';
import User from '../models/User';
import Car from '../models/Car';
import dayjs from 'dayjs';

export const analyticsService = {
  // 1. Core KPIs (Total Revenue, Total Bookings, Active Users, Total Cars)
  async getDashboardKPIs() {
    const startOfMonth = dayjs().startOf('month').toDate();

    const [bookingStats, userCount, carCount] = await Promise.all([
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'active', 'completed'] } } },
        { 
          $group: { 
            _id: null, 
            totalRevenue: { $sum: '$totalAmount' },
            totalBookings: { $sum: 1 },
            // Monthly snapshot for quick comparison
            thisMonthRevenue: {
              $sum: {
                $cond: [{ $gte: ['$createdAt', startOfMonth] }, '$totalAmount', 0]
              }
            }
          } 
        }
      ]),
      User.countDocuments({ status: 'active' }),
      Car.countDocuments({ status: { $ne: 'retired' } })
    ]);

    const stats = bookingStats[0] || { totalRevenue: 0, totalBookings: 0, thisMonthRevenue: 0 };

    return {
      totalRevenue: stats.totalRevenue,
      thisMonthRevenue: stats.thisMonthRevenue,
      totalBookings: stats.totalBookings,
      activeUsers: userCount,
      totalCars: carCount
    };
  },

  // 2. Revenue & Booking Trends (Chart Data)
  async getMonthlyRevenueChart(year: number = dayjs().year()) {
    const startDate = dayjs().year(year).startOf('year').toDate();
    const endDate = dayjs().year(year).endOf('year').toDate();

    const monthlyData = await Booking.aggregate([
      { 
        $match: { 
          status: { $in: ['confirmed', 'completed'] },
          createdAt: { $gte: startDate, $lte: endDate }
        } 
      },
      {
        $group: {
          _id: { $month: '$createdAt' }, // Group by month number (1-12)
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } } // Sort by month
    ]);

    // Format for frontend charting libraries (ensure all 12 months exist)
    const formattedChart = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyData.find((m: any) => m._id === i + 1);
      return {
        month: dayjs().month(i).format('MMM'),
        revenue: monthData ? monthData.revenue : 0,
        bookings: monthData ? monthData.bookings : 0
      };
    });

    return formattedChart;
  },

  // 3. Car Utilization (Which categories are most popular?)
  async getCarUtilization() {
    const utilization = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'active', 'completed'] } } },
      {
        $lookup: {
          from: 'cars', // The MongoDB collection name for cars
          localField: 'car',
          foreignField: '_id',
          as: 'carDetails'
        }
      },
      { $unwind: '$carDetails' },
      {
        $group: {
          _id: '$carDetails.category',
          totalBookedDays: { $sum: '$totalDays' },
          revenueGenerated: { $sum: '$totalAmount' }
        }
      },
      { $sort: { revenueGenerated: -1 } }
    ]);

    return utilization;
  }
};
