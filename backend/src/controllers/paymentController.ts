import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { paymentService } from '../services/paymentService';
import { ApiResponse } from '../utils/ApiResponse';

/**
 * POST /api/v1/payments/create-order
 * Creates a Razorpay order for a given booking.
 */
export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    res.status(400).json(new ApiResponse(400, null, 'bookingId is required'));
    return;
  }

  const result = await paymentService.createOrder(bookingId, req.user!.id);
  res.status(200).json(new ApiResponse(200, result, 'Razorpay order created'));
});

/**
 * POST /api/v1/payments/verify
 * Verifies a Razorpay payment signature and updates booking + payment records.
 */
export const verifyPayment = catchAsync(async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json(new ApiResponse(400, null, 'Missing required Razorpay fields'));
    return;
  }

  const result = await paymentService.verifyPayment(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    req.user!.id
  );
  res.status(200).json(new ApiResponse(200, result, 'Payment verified successfully'));
});

/**
 * GET /api/v1/payments/history
 * Returns all payments for the authenticated user.
 */
export const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const history = await paymentService.getPaymentHistory(req.user!.id);
  res.status(200).json(new ApiResponse(200, history, 'Payment history retrieved'));
});

/**
 * GET /api/v1/payments/:id
 * Returns a single payment by ID.
 */
export const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const payment = await paymentService.getPaymentById(req.params.id as string, req.user!.id);
  res.status(200).json(new ApiResponse(200, payment, 'Payment details retrieved'));
});

/**
 * GET /api/v1/payments/booking/:bookingId
 * Returns payment record for a specific booking.
 */
export const getPaymentByBooking = catchAsync(async (req: Request, res: Response) => {
  const payment = await paymentService.getPaymentByBookingId(req.params.bookingId as string, req.user!.id);
  res.status(200).json(new ApiResponse(200, payment, payment ? 'Payment found' : 'No payment for this booking'));
});
