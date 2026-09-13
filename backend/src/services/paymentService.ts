import crypto from 'crypto';
import { razorpay } from '../config/razorpay';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorMiddleware';
import logger from '../utils/logger';
import { BookingStatus, CarStatus, PaymentRecordStatus } from '@prisma/client';

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
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        car: { select: { id: true, make: true, carModel: true, year: true, images: true } },
      },
    });

    if (!booking) throw new AppError(404, 'Booking not found');
    if (booking.userId !== userId) throw new AppError(403, 'Not authorized to pay for this booking');

    if (booking.paymentStatus === 'paid') {
      throw new AppError(400, 'Payment already completed for this booking');
    }
    if (booking.status === 'cancelled') {
      throw new AppError(400, 'Cannot pay for a cancelled booking');
    }
    if (booking.status === 'completed') {
      throw new AppError(400, 'Cannot pay for a completed booking');
    }

    const amountInPaise = Math.round(Number(booking.totalAmount) * 100);

    const options = {
      amount:  amountInPaise,
      currency: 'INR',
      receipt:  `receipt_${booking.id.slice(-10)}`,
      notes: {
        bookingId: booking.id,
        userId,
      },
    };

    logger.info(`Creating Razorpay order for booking ${bookingId}, amount: ₹${booking.totalAmount}`);

    const order = await razorpay.orders.create(options);

    // Upsert payment record — avoids duplicate key if user retries
    const payment = await prisma.payment.upsert({
      where:  { bookingId },
      update: {
        razorpayOrderId: order.id,
        status:          PaymentRecordStatus.pending,
        amount:          Number(booking.totalAmount),
        currency:        'INR',
        userId,
      },
      create: {
        bookingId,
        userId,
        razorpayOrderId: order.id,
        amount:          Number(booking.totalAmount),
        currency:        'INR',
        status:          PaymentRecordStatus.pending,
      },
    });

    return {
      order_id: order.id,
      amount:   order.amount,
      currency: order.currency,
      key:      process.env.RAZORPAY_KEY_ID,
      booking: {
        id:                booking.id,
        car:               booking.car,
        startDate:         booking.startDate,
        endDate:           booking.endDate,
        totalDays:         booking.totalDays,
        totalAmount:       Number(booking.totalAmount),
        dailyRateAtBooking: Number(booking.dailyRateAtBooking),
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
    // Step 1: Verify HMAC signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      logger.warn(`Payment signature mismatch for order ${razorpay_order_id}`);

      // Mark payment + booking as failed atomically
      const failedPayment = await prisma.payment.findUnique({
        where: { razorpayOrderId: razorpay_order_id },
      });
      if (failedPayment) {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: failedPayment.id },
            data:  { status: PaymentRecordStatus.failed },
          }),
          prisma.booking.update({
            where: { id: failedPayment.bookingId },
            data:  { paymentStatus: 'failed' },
          }),
        ]);
      }

      throw new AppError(400, 'Invalid payment signature — payment marked as failed');
    }

    // Step 2: Find payment record
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });
    if (!payment) throw new AppError(404, 'Payment record not found for this order');
    if (payment.userId !== userId) throw new AppError(403, 'Not authorized');

    // Step 3 & 4: Update payment + booking + car atomically
    const { updatedPayment, updatedBooking } = await prisma.$transaction(async (tx) => {
      const [p, b] = await Promise.all([
        tx.payment.update({
          where: { id: payment.id },
          data: {
            status:             PaymentRecordStatus.succeeded,
            razorpayPaymentId:  razorpay_payment_id,
            razorpaySignature:  razorpay_signature,
            paidAt:             new Date(),
          },
        }),
        tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: BookingStatus.confirmed, paymentStatus: 'paid' },
        }),
      ]);
      // Mark car as rented — prevents double-booking while rental is active
      await tx.car.update({ where: { id: b.carId }, data: { status: CarStatus.rented } });
      return { updatedPayment: p, updatedBooking: b };
    });

    logger.info(`Payment verified: order=${razorpay_order_id}, payment=${razorpay_payment_id}`);

    return {
      success:       true,
      paymentId:     updatedPayment.id,
      bookingId:     updatedBooking.id,
      amount:        Number(updatedPayment.amount),
      transactionId: razorpay_payment_id,
    };
  },

  // ─── Get Single Payment ───────────────────────────────────────────────────
  async getPaymentById(paymentId: string, userId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          select: {
            id: true, startDate: true, endDate: true, totalAmount: true,
            totalDays: true, dailyRateAtBooking: true, status: true, paymentStatus: true,
            car: {
              select: {
                id: true, make: true, carModel: true, year: true,
                images: true, category: true,
                locationAddress: true, locationLat: true, locationLng: true,
              },
            },
          },
        },
      },
    });

    if (!payment) throw new AppError(404, 'Payment not found');
    if (payment.userId !== userId) throw new AppError(403, 'Not authorized');

    return payment;
  },

  // ─── Payment History ──────────────────────────────────────────────────────
  async getPaymentHistory(userId: string) {
    return await prisma.payment.findMany({
      where: { userId },
      include: {
        booking: {
          select: {
            id: true, startDate: true, endDate: true, totalAmount: true,
            totalDays: true, dailyRateAtBooking: true, status: true, paymentStatus: true,
            car: {
              select: { id: true, make: true, carModel: true, year: true, images: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  // ─── Get Payment by Booking ID ────────────────────────────────────────────
  async getPaymentByBookingId(bookingId: string, userId: string) {
    const payment = await prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: {
          select: {
            id: true, startDate: true, endDate: true, totalAmount: true,
            totalDays: true, dailyRateAtBooking: true, status: true, paymentStatus: true,
            car: {
              select: {
                id: true, make: true, carModel: true, year: true,
                images: true, category: true,
                locationAddress: true, locationLat: true, locationLng: true,
              },
            },
          },
        },
      },
    });

    if (!payment) return null;
    if (payment.userId !== userId) throw new AppError(403, 'Not authorized');

    return payment;
  },

  // ─── Demo Capture (no gateway, dev/portfolio only) ────────────────────────
  async demoCapture(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new AppError(404, 'Booking not found');
    if (booking.userId !== userId) throw new AppError(403, 'Not authorized');
    if (booking.paymentStatus === 'paid') throw new AppError(400, 'Already paid');
    if (booking.status === 'cancelled') throw new AppError(400, 'Booking is cancelled');

    const demoPaymentId = `demo_${Date.now()}`;

    const { payment, updatedBooking } = await prisma.$transaction(async (tx) => {
      const [p, b] = await Promise.all([
        tx.payment.upsert({
          where:  { bookingId },
          update: {
            razorpayOrderId:   `demo_order_${bookingId}`,
            razorpayPaymentId: demoPaymentId,
            status:            PaymentRecordStatus.succeeded,
            paidAt:            new Date(),
            amount:            Number(booking.totalAmount),
            currency:          'INR',
            userId,
          },
          create: {
            bookingId,
            userId,
            razorpayOrderId:   `demo_order_${bookingId}`,
            razorpayPaymentId: demoPaymentId,
            amount:            Number(booking.totalAmount),
            currency:          'INR',
            status:            PaymentRecordStatus.succeeded,
            paidAt:            new Date(),
          },
        }),
        tx.booking.update({
          where: { id: bookingId },
          data:  { status: BookingStatus.confirmed, paymentStatus: 'paid' },
        }),
      ]);
      // Mark car as rented (demo mode — same status as real payment flow)
      await tx.car.update({ where: { id: b.carId }, data: { status: CarStatus.rented } });
      return { payment: p, updatedBooking: b };
    });

    logger.info(`Demo payment captured for booking ${bookingId} (no gateway)`);

    return {
      success:       true,
      paymentId:     payment.id,
      bookingId:     updatedBooking.id,
      amount:        Number(updatedBooking.totalAmount),
      transactionId: demoPaymentId,
    };
  },
};
