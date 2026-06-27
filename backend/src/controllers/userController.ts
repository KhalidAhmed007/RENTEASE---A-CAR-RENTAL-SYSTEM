import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { userService } from '../services/userService';
import { ApiResponse } from '../utils/ApiResponse';

export const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getProfile(req.user!.id);
  res.status(200).json(new ApiResponse(200, user, 'Profile fetched successfully'));
});

export const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const updatedUser = await userService.updateProfile(req.user!.id, req.body);
  res.status(200).json(new ApiResponse(200, updatedUser, 'Profile updated successfully'));
});

export const updateMyPassword = catchAsync(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  await userService.updatePassword(req.user!.id, currentPassword, newPassword);
  res.status(200).json(new ApiResponse(200, null, 'Password updated successfully'));
});

export const getMyBookingHistory = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string | undefined;

  const result = await userService.getUserBookings(req.user!.id, page, limit, status);
  res.status(200).json(new ApiResponse(200, result, 'Booking history fetched successfully'));
});
