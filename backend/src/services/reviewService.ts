import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/errorMiddleware';

export const reviewService = {
  /**
   * Submit a review. User must have a completed booking for the car.
   * Each booking can only have one review (enforced by @unique on Review.bookingId).
   */
  async createReview(userId: string, carId: string, bookingId: string, rating: number, comment: string) {
    // Verify the booking belongs to this user, is for this car, and is completed
    const booking = await prisma.booking.findFirst({
      where: {
        id:     bookingId,
        userId,
        carId,
        status: 'completed',
      },
    });

    if (!booking) {
      throw new AppError(400, 'You can only review cars from completed bookings');
    }

    // Create review (unique constraint on bookingId prevents duplicates)
    const review = await prisma.review.create({
      data: { carId, userId, bookingId, rating, comment },
    });

    // Recalculate average rating for the car
    const stats = await prisma.review.aggregate({
      where: { carId },
      _avg:   { rating: true },
      _count: { rating: true },
    });

    await prisma.car.update({
      where: { id: carId },
      data: {
        averageRating: stats._avg.rating
          ? Math.round(stats._avg.rating * 10) / 10
          : 0,
        reviewCount: stats._count.rating,
      },
    });

    return review;
  },

  async getCarReviews(carId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { carId },
        include: {
          user: { select: { id: true, firstName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { carId } }),
    ]);

    return {
      reviews,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getUserReviews(userId: string) {
    return prisma.review.findMany({
      where: { userId },
      include: {
        car: {
          select: { id: true, make: true, carModel: true, year: true, images: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
