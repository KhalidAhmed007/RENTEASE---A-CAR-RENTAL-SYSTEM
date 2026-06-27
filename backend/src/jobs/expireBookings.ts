import cron from 'node-cron';
import Booking from '../models/Booking';
import logger from '../utils/logger';

export const startBookingExpiryJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      
      const result = await Booking.updateMany(
        { 
          status: 'pending', 
          createdAt: { $lt: fifteenMinutesAgo } 
        },
        { 
          $set: { 
            status: 'cancelled', 
            cancellationReason: 'Payment timeout (System Auto-Cancel)' 
          } 
        }
      );

      if (result.modifiedCount > 0) {
        logger.info(`Expired ${result.modifiedCount} abandoned bookings.`);
      }
    } catch (error) {
      logger.error('Error in Booking Expiry Job:', error);
    }
  });
};
