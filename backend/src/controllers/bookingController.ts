import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { bookingService } from '../services/bookingService';
import { ApiResponse } from '../utils/ApiResponse';
import { AppError } from '../middlewares/errorMiddleware';

export const createBooking = catchAsync(async (req: Request, res: Response) => {
  const { carId, startDate, endDate } = req.body;
  const booking = await bookingService.createBooking(req.user!.id, carId, new Date(startDate), new Date(endDate));
  res.status(201).json(new ApiResponse(201, booking, 'Booking created. Proceed to payment.'));
});

export const cancelBooking = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingService.cancelBooking(req.params.id as string, req.user!.id, req.user!.role);
  res.status(200).json(new ApiResponse(200, result, 'Booking cancelled successfully'));
});

export const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const booking = await bookingService.getBookingById(req.params.id, req.user!.id, req.user!.role);
  res.status(200).json(new ApiResponse(200, booking, 'Booking retrieved successfully'));
});

export const getMyBookings = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  
  const data = await bookingService.getMyBookings(req.user!.id, page, limit);
  res.status(200).json(new ApiResponse(200, data, 'User bookings retrieved successfully'));
});

export const clearBookingHistory = catchAsync(async (req: Request, res: Response) => {
  const result = await bookingService.clearBookingHistory(req.user!.id);
  res.status(200).json(new ApiResponse(200, result, 'Booking history cleared successfully'));
});
