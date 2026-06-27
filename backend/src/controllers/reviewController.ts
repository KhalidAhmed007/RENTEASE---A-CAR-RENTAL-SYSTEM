import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { reviewService } from '../services/reviewService';
import { ApiResponse } from '../utils/ApiResponse';

export const createReview = catchAsync(async (req: Request, res: Response) => {
  const { carId, bookingId, rating, comment } = req.body;
  const review = await reviewService.createReview(req.user!.id, carId, bookingId, rating, comment);
  res.status(201).json(new ApiResponse(201, review, 'Review submitted successfully'));
});

export const getCarReviews = catchAsync(async (req: Request, res: Response) => {
  const page  = parseInt(req.query.page  as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const data = await reviewService.getCarReviews(req.params.carId as string, page, limit);
  res.status(200).json(new ApiResponse(200, data, 'Reviews retrieved'));
});

export const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const reviews = await reviewService.getUserReviews(req.user!.id);
  res.status(200).json(new ApiResponse(200, reviews, 'Your reviews retrieved'));
});
