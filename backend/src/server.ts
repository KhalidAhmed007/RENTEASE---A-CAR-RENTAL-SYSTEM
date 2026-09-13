import app from './app';
import { connectDB, disconnectDB } from './config/db';
import { env } from './config/env';
import logger from './utils/logger';
import { connectRedis } from './config/redis';
import { startBookingExpiryJob } from './jobs/expireBookings';

const startServer = async () => {
  logger.info('Starting server...');

  // 1. Connect to PostgreSQL via Prisma
  await connectDB();

  // 2. Connect to Redis (optional — don't block startup)
  connectRedis().catch(() => {
    logger.warn('Redis connection failed — continuing without cache.');
  });

  // 3. Start cron jobs
  startBookingExpiryJob();

  // 4. Start listening
  const server = app.listen(env.port, () => {
    logger.info(`Server is running in ${env.nodeEnv} mode on port ${env.port}`);
  });

  process.on('unhandledRejection', (err: Error) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
    server.close(async () => {
      await disconnectDB();
      process.exit(1);
    });
  });

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  });
};

startServer();
