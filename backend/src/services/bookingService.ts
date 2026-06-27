import mongoose from 'mongoose';
import Booking from '../models/Booking';
import Car from '../models/Car';
import Payment from '../models/Payment';
import { AppError } from '../middlewares/errorMiddleware';
import dayjs from 'dayjs';

export const bookingService = {
  async createBooking(userId: string, carId: string, startDate: Date, endDate: Date) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const car = await Car.findById(carId).session(session);
      if (!car || car.status !== 'available') {
        throw new AppError(400, 'Car is not available for booking');
      }

      const overlappingBooking = await Booking.findOne({
        car: carId,
        status: { $in: ['pending', 'confirmed', 'active'] },
        $or: [
          { startDate: { $lt: endDate }, endDate: { $gt: startDate } }
        ]
      }).session(session);

      if (overlappingBooking) {
        throw new AppError(409, 'Car is already booked for these dates');
      }

      const start = dayjs(startDate);
      const end = dayjs(endDate);
      const totalDays = end.diff(start, 'day') || 1;
      const totalAmount = totalDays * car.dailyRate;

      const booking = await Booking.create([{
        user: userId,
        car: carId,
        startDate,
        endDate,
        totalDays,
        dailyRateAtBooking: car.dailyRate,
        totalAmount,
        status: 'pending'
      }], { session });

      const payment = await Payment.create([{
        booking: booking[0]._id,
        user: userId,
        paymentProvider: 'razorpay',
        amount: totalAmount,
        currency: 'INR',
        status: 'pending'
      }], { session });

      booking[0].payment = payment[0]._id;
      await booking[0].save({ session });

      await session.commitTransaction();
      return booking[0];

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  async cancelBooking(bookingId: string, userId: string, role: string) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError(404, 'Booking not found');

    if (booking.user.toString() !== userId && role !== 'admin') {
      throw new AppError(403, 'Not authorized to cancel this booking');
    }

    if (booking.status === 'completed' || booking.status === 'active') {
      throw new AppError(400, `Cannot cancel an ${booking.status} booking`);
    }

    let refundStatus = 'none';
    if (booking.status === 'confirmed') {
      const daysUntilStart = dayjs(booking.startDate).diff(dayjs(), 'day');
      if (daysUntilStart >= 2) {
        refundStatus = 'full_refund_queued';
      } else {
        refundStatus = 'partial_refund_queued';
      }
    }

    booking.status = 'cancelled';
    booking.cancellationReason = 'User requested cancellation';
    await booking.save();

    // Update the linked payment to reflect the cancellation
    if (booking.payment) {
      await Payment.findByIdAndUpdate(booking.payment, { $set: { status: 'refunded' } });
    }

    return { booking, refundStatus };
  },

  async getMyBookings(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      Booking.find({ user: userId })
        .populate('car', 'make carModel year images category location')
        .populate('payment', 'status amount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments({ user: userId })
    ]);

    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async getBookingById(bookingId: string, userId: string, role: string) {
    const booking = await Booking.findById(bookingId)
      .populate('car', 'make carModel year images category dailyRate location')
      .populate('payment', 'status amount razorpayPaymentId razorpayOrderId paidAt currency')
      .lean();

    if (!booking) throw new AppError(404, 'Booking not found');

    // Only allow the owner or admin to view the booking
    if (booking.user.toString() !== userId && role !== 'admin') {
      throw new AppError(403, 'Not authorized to view this booking');
    }

    return booking;
  },

  async clearBookingHistory(userId: string) {
    const result = await Booking.deleteMany({
      user: userId,
      status: { $in: ['completed', 'cancelled'] }
    });
    return result;
  }
};
