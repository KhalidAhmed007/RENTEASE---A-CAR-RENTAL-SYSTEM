import Review from '../models/Review';
import Booking from '../models/Booking';
import Car from '../models/Car';
import { AppError } from '../middlewares/errorMiddleware';

export const reviewService = {
  /**
   * Submit a review. User must have a completed booking for the car.
   * Each booking can only have one review (enforced by unique index on booking).
   */
  async createReview(userId: string, carId: string, bookingId: string, rating: number, comment: string) {
    // Verify the booking belongs to this user and is completed
    const booking = await Booking.findOne({
      _id: bookingId,
      user: userId,
      car: carId,
      status: 'completed',
    });
    if (!booking) {
      throw new AppError(400, 'You can only review cars from completed bookings');
    }

    const review = await Review.create({
      car: carId,
      user: userId,
      booking: bookingId,
      rating,
      comment,
    });

    // Recalculate and update the car's average rating atomically
    const stats = await Review.aggregate([
      { $match: { car: review.car } },
      { $group: { _id: '$car', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      await Car.findByIdAndUpdate(carId, {
        averageRating: Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].count,
      });
    }

    return review;
  },

  async getCarReviews(carId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      Review.find({ car: carId })
        .populate('user', 'firstName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ car: carId }),
    ]);

    return {
      reviews,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getUserReviews(userId: string) {
    return Review.find({ user: userId })
      .populate('car', 'make carModel year images')
      .sort({ createdAt: -1 })
      .lean();
  },
};
