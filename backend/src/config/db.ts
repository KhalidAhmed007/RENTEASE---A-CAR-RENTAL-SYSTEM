import { prisma } from './prisma';
import logger from '../utils/logger';

export const connectDB = async () => {
  try {
    // Prisma lazily connects. We run a lightweight query to verify connectivity.
    await prisma.$connect();
    logger.info('PostgreSQL connected via Prisma');
  } catch (error) {
    logger.error(`PostgreSQL connection failed: ${(error as Error).message}`);
    logger.error('CRITICAL: Cannot connect to database.');
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await prisma.$disconnect();
  logger.info('PostgreSQL disconnected');
};
