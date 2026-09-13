import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorMiddleware';
import dayjs from 'dayjs';
import { BookingStatus, CarStatus, PaymentRecordStatus } from '@prisma/client';

export const bookingService = {
  // ─── Create Booking (atomic transaction) ─────────────────────────────────
  async createBooking(userId: string, carId: string, startDate: Date, endDate: Date) {
    return await prisma.$transaction(async (tx) => {
      // 1. Verify car exists and is available
      const car = await tx.car.findUnique({ where: { id: carId } });
      if (!car || car.status !== 'available') {
        throw new AppError(400, 'Car is not available for booking');
      }

      // 2. Check for date conflicts
      const overlapping = await tx.booking.findFirst({
        where: {
          carId,
          status: { in: ['pending', 'confirmed', 'active'] },
          startDate: { lt: endDate },
          endDate:   { gt: startDate },
        },
      });

      if (overlapping) {
        throw new AppError(409, 'Car is already booked for these dates');
      }

      // 3. Calculate totals
      const start = dayjs(startDate);
      const end   = dayjs(endDate);
      const totalDays   = end.diff(start, 'day') || 1;
      const dailyRate   = Number(car.dailyRate);
      const totalAmount = totalDays * dailyRate;

      // 4. Create booking
      const booking = await tx.booking.create({
        data: {
          userId,
          carId,
          startDate,
          endDate,
          totalDays,
          dailyRateAtBooking: dailyRate,
          totalAmount,
          status: BookingStatus.pending,
        },
      });

      // 5. Create payment record linked to booking
      await tx.payment.create({
        data: {
          bookingId: booking.id,
          userId,
          amount:   totalAmount,
          currency: 'INR',
          status:   PaymentRecordStatus.pending,
        },
      });

      return booking;
    });
  },

  // ─── Cancel Booking ───────────────────────────────────────────────────────
  async cancelBooking(bookingId: string, userId: string, role: string) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new AppError(404, 'Booking not found');

    if (booking.userId !== userId && role !== 'admin') {
      throw new AppError(403, 'Not authorized to cancel this booking');
    }

    if (booking.status === 'completed' || booking.status === 'active') {
      throw new AppError(400, `Cannot cancel an ${booking.status} booking`);
    }

    let refundStatus = 'none';
    if (booking.status === 'confirmed') {
      const daysUntilStart = dayjs(booking.startDate).diff(dayjs(), 'day');
      refundStatus = daysUntilStart >= 2 ? 'full_refund_queued' : 'partial_refund_queued';
    }

    const [updatedBooking] = await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.cancelled,
          cancellationReason: 'User requested cancellation',
        },
      }),
      prisma.payment.updateMany({
        where: { bookingId },
        data:  { status: PaymentRecordStatus.refunded },
      }),
      // Restore car to available so it can be rebooked
      prisma.car.update({
        where: { id: booking.carId },
        data:  { status: CarStatus.available },
      }),
    ]);

    return { booking: updatedBooking, refundStatus };
  },

  // ─── Get My Bookings (paginated) ──────────────────────────────────────────
  async getMyBookings(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: { userId },
        include: {
          car: {
            select: {
              id: true, make: true, carModel: true, year: true,
              images: true, category: true,
              locationAddress: true, locationLat: true, locationLng: true,
            },
          },
          payment: {
            select: { id: true, status: true, amount: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where: { userId } }),
    ]);

    return {
      bookings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  // ─── Get Single Booking ───────────────────────────────────────────────────
  async getBookingById(bookingId: string, userId: string, role: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        car: {
          select: {
            id: true, make: true, carModel: true, year: true,
            images: true, category: true, dailyRate: true,
            locationAddress: true, locationLat: true, locationLng: true,
          },
        },
        payment: {
          select: {
            id: true, status: true, amount: true,
            razorpayPaymentId: true, razorpayOrderId: true,
            paidAt: true, currency: true,
          },
        },
      },
    });

    if (!booking) throw new AppError(404, 'Booking not found');

    if (booking.userId !== userId && role !== 'admin') {
      throw new AppError(403, 'Not authorized to view this booking');
    }

    return booking;
  },

  // ─── Clear Booking History ────────────────────────────────────────────────
  async clearBookingHistory(userId: string) {
    const result = await prisma.booking.deleteMany({
      where: {
        userId,
        status: { in: ['completed', 'cancelled'] },
      },
    });
    return result;
  },
};
