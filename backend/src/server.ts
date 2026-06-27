import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import logger from './utils/logger';

import { connectRedis } from './config/redis';

const startServer = async () => {
  logger.info('Starting server...');

  // 1. Connect to MongoDB (required — will exit if both Atlas & local fail)
  await connectDB();

  // 2. Connect to Redis (optional — don't block startup)
  connectRedis().catch(() => {
    logger.warn('Redis connection failed — continuing without cache.');
  });

  // 3. Start listening
  const server = app.listen(env.port, () => {
    logger.info(`Server is running in ${env.nodeEnv} mode on port ${env.port}`);
  });

  process.on('unhandledRejection', (err: Error) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
    server.close(() => process.exit(1));
  });
};

startServer();

