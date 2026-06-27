import { createClient } from 'redis';
import logger from '../utils/logger';

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        logger.warn('Redis: Max reconnection attempts reached. Running without cache.');
        return false; // Stop retrying
      }
      return Math.min(retries * 500, 2000);
    }
  }
});

redisClient.on('error', (err) => {
  // Only log once — suppress repeat ECONNREFUSED spam
  if (err.code !== 'ECONNREFUSED') {
    logger.error('Redis Client Error', err);
  }
});
redisClient.on('connect', () => logger.info('Redis Client Connected'));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch {
    logger.warn('Redis unavailable. Caching disabled — app will continue normally.');
  }
};
