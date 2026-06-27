import User from '../models/User';
import Booking from '../models/Booking';
import bcrypt from 'bcrypt';
import { AppError } from '../middlewares/errorMiddleware';
import { Types } from 'mongoose';

export const userService = {
  async getProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError(404, 'User not found');
    return user;
  },

  async updateProfile(userId: string, updateData: any) {
    const restrictedFields = ['passwordHash', 'role', 'email', 'status', 'licenseStatus'];
    restrictedFields.forEach(field => delete updateData[field]);

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) throw new AppError(404, 'User not found');
    return updatedUser;
  },

  async updatePassword(userId: string, currentPasswordString: string, newPasswordString: string) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) throw new AppError(404, 'User not found');

    const isMatch = await bcrypt.compare(currentPasswordString, user.passwordHash);
    if (!isMatch) throw new AppError(400, 'Current password is incorrect');

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPasswordString, salt);
    
    await user.save({ validateBeforeSave: false });
  },

  async getUserBookings(userId: string, page: number = 1, limit: number = 10, statusFilter?: string) {
    const skip = (page - 1) * limit;
    const query: any = { user: new Types.ObjectId(userId) };
    if (statusFilter) {
      query.status = statusFilter;
    }

    const [bookings, totalCount] = await Promise.all([
      Booking.find(query)
        .populate('car', 'make carModel year images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Booking.countDocuments(query)
    ]);

    return {
      bookings,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }
};
