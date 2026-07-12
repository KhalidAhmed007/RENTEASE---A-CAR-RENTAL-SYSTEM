import crypto from 'crypto';
import { razorpay } from '../config/razorpay';
import Booking from '../models/Booking';
import Payment from '../models/Payment';
import { AppError } from '../middlewares/errorMiddleware';
import logger from '../utils/logger';

/**
 * ─── Payment Service ──────────────────────────────────────────────────────────
 * Handles Razorpay order creation, payment verification, and payment history.
 *
 * RAZORPAY TEST MODE:
 *   - Uses test key_id / key_secret from .env
 *   - No real money is charged
 *   - In production, swap RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
 *     to live keys obtained from the Razorpay Dashboard after
 *     completing KYC / business verification.
 * ──────────────────────────────────────────────────────────────────────────────
 */

export const paymentService = {
  // ─── Create Razorpay Order ────────────────────────────────────────────────
  async createOrder(bookingId: string, userId: string) {
    const booking = await Booking.findById(bookingId).populate('car', 'make carModel year images');

    if (!booking) throw new AppError(404, 'Booking not found');
    if (booking.user.toString() !== userId) throw new AppError(403, 'Not authorized to pay for this booking');

    // Only allow payment for pending-payment bookings
    if (booking.paymentStatus === 'paid') {
      throw new AppError(400, 'Payment already completed for this booking');
    }
    if (booking.status === 'cancelled') {
      throw new AppError(400, 'Cannot pay for a cancelled booking');
    }
    if (booking.status === 'completed') {
      throw new AppError(400, 'Cannot pay for a completed booking');
    }

    // Razorpay expects amount in smallest currency unit (paise for INR)
    const amountInPaise = Math.round(booking.totalAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${booking._id.toString().slice(-10)}`,
      notes: {
        bookingId: booking._id.toString(),
        userId: userId.toString(),
      },
    };

    logger.info(`Creating Razorpay order for booking ${bookingId}, amount: ₹${booking.totalAmount}`);

    const order = await razorpay.orders.create(options);

    // Upsert payment record — avoids E11000 duplicate key if user retries
    const payment = await Payment.findOneAndUpdate(
      { booking: booking._id },
      {
        $set: {
          user: userId,
          razorpayOrderId: order.id,
          paymentProvider: 'razorpay',
          amount: booking.totalAmount,
          currency: 'INR',
          status: 'pending',
        },
      },
      { upsert: true, new: true }
    );

    // Link payment to booking
    if (!booking.payment) {
      booking.payment = payment._id;
      await booking.save();
    }

    return {
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      // In production, this key would be the LIVE key_id
      key: process.env.RAZORPAY_KEY_ID,
      booking: {
        _id: booking._id,
        car: booking.car,
        startDate: booking.startDate,
        endDate: booking.endDate,
        totalDays: booking.totalDays,
        totalAmount: booking.totalAmount,
        dailyRateAtBooking: booking.dailyRateAtBooking,
      },
    };
  },

  // ─── Verify Payment Signature ─────────────────────────────────────────────
  async verifyPayment(
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    userId: string
  ) {
    // Step 1: Verify HMAC signature (never trust the frontend)
    //   signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
    //   In production, RAZORPAY_KEY_SECRET would be the live secret.
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      logger.warn(`Payment signature mismatch for order ${razorpay_order_id}`);
      // Find the payment first, then update both records atomically
      const failedPayment = await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { $set: { status: 'failed' } },
        { new: true }
      );
      if (failedPayment) {
        await Booking.findByIdAndUpdate(
          failedPayment.booking,
          { $set: { paymentStatus: 'failed' } }
        );
      }
      throw new AppError(400, 'Invalid payment signature — payment marked as failed');
    }

    // Step 2: Find the payment record
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) throw new AppError(404, 'Payment record not found for this order');
    if (payment.user.toString() !== userId) throw new AppError(403, 'Not authorized');

    // Step 3: Update payment record
    payment.status = 'succeeded';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.paidAt = new Date();
    await payment.save();

    // Step 4: Update booking — mark as confirmed & paid
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.status = 'confirmed';
      booking.paymentStatus = 'paid';
      booking.payment = payment._id;
      await booking.save();
    }

    logger.info(`Payment verified: order=${razorpay_order_id}, payment=${razorpay_payment_id}`);

    return {
      success: true,
      paymentId: payment._id,
      bookingId: booking?._id,
      amount: payment.amount,
      transactionId: razorpay_payment_id,
    };
  },

  // ─── Get Single Payment ───────────────────────────────────────────────────
  async getPaymentById(paymentId: string, userId: string) {
    const payment = await Payment.findById(paymentId)
      .populate({
        path: 'booking',
        select: 'startDate endDate totalAmount totalDays dailyRateAtBooking status paymentStatus car',
        populate: {
          path: 'car',
          select: 'make carModel year images category location',
        },
      })
      .lean();

    if (!payment) throw new AppError(404, 'Payment not found');
    if (payment.user.toString() !== userId) throw new AppError(403, 'Not authorized');

    return payment;
  },

  // ─── Payment History ──────────────────────────────────────────────────────
  async getPaymentHistory(userId: string) {
    return await Payment.find({ user: userId })
      .populate({
        path: 'booking',
        select: 'startDate endDate totalAmount totalDays dailyRateAtBooking status paymentStatus car',
        populate: {
          path: 'car',
          select: 'make carModel year images',
        },
      })
      .sort({ createdAt: -1 })
      .lean();
  },

  // ─── Get Payment by Booking ID ────────────────────────────────────────────
  async getPaymentByBookingId(bookingId: string, userId: string) {
    const payment = await Payment.findOne({ booking: bookingId })
      .populate({
        path: 'booking',
        select: 'startDate endDate totalAmount totalDays dailyRateAtBooking status paymentStatus car',
        populate: {
          path: 'car',
          select: 'make carModel year images category location',
        },
      })
      .lean();

    if (!payment) return null;
    if (payment.user.toString() !== userId) throw new AppError(403, 'Not authorized');

    return payment;
  },

  // ─── Demo Capture (no gateway, dev/portfolio only) ────────────────────────
  async demoCapture(bookingId: string, userId: string) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError(404, 'Booking not found');
    if (booking.user.toString() !== userId) throw new AppError(403, 'Not authorized');
    if (booking.paymentStatus === 'paid') throw new AppError(400, 'Already paid');
    if (booking.status === 'cancelled') throw new AppError(400, 'Booking is cancelled');

    // Create or update a payment record marked as succeeded
    const demoPaymentId = `demo_${Date.now()}`;
    const payment = await Payment.findOneAndUpdate(
      { booking: booking._id },
      {
        $set: {
          user: userId,
          razorpayOrderId: `demo_order_${bookingId}`,
          razorpayPaymentId: demoPaymentId,
          paymentProvider: 'razorpay',
          amount: booking.totalAmount,
          currency: 'INR',
          status: 'succeeded',
          paidAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    // Mark booking confirmed
    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.payment = payment._id;
    await booking.save();

    logger.info(`Demo payment captured for booking ${bookingId} (no gateway)`);

    return {
      success: true,
      paymentId: payment._id,
      bookingId: booking._id,
      amount: booking.totalAmount,
      transactionId: demoPaymentId,
    };
  },
};
