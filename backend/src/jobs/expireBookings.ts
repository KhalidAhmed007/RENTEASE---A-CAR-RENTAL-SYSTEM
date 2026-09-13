import cron from 'node-cron';
import { prisma } from '../config/prisma';
import logger from '../utils/logger';

/**
 * Expire pending bookings older than 15 minutes.
 * Also restores the associated car status to `available`.
 * Runs every 5 minutes via cron.
 */
export const startBookingExpiryJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      // Find all expired pending bookings (with carId) before updating
      const expiredBookings = await prisma.booking.findMany({
        where: {
          status:    'pending',
          createdAt: { lt: fifteenMinutesAgo },
        },
        select: { id: true, carId: true },
      });

      if (expiredBookings.length === 0) return;

      const bookingIds = expiredBookings.map((b) => b.id);
      const carIds     = [...new Set(expiredBookings.map((b) => b.carId))];

      // Atomically cancel bookings and restore car availability
      await prisma.$transaction([
        prisma.booking.updateMany({
          where: { id: { in: bookingIds } },
          data: {
            status:             'cancelled',
            cancellationReason: 'Payment timeout (System Auto-Cancel)',
          },
        }),
        // Only restore cars that are currently in `rented` status —
        // avoids accidentally overwriting a car in `maintenance` or `retired`.
        prisma.car.updateMany({
          where: { id: { in: carIds }, status: 'rented' },
          data:  { status: 'available' },
        }),
      ]);

      logger.info(`Expired ${expiredBookings.length} abandoned booking(s) and restored ${carIds.length} car(s).`);
    } catch (error) {
      logger.error('Error in Booking Expiry Job:', error);
    }
  });
};
