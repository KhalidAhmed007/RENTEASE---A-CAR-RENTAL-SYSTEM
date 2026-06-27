import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/redis';
import logger from '../utils/logger';

export const cacheResponse = (durationInSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    if (!redisClient.isReady) {
      return next(); // Proceed without cache if Redis is down
    }

    const key = `__express__${req.originalUrl || req.url}`;

    try {
      const cachedBody = await redisClient.get(key);
      if (cachedBody) {
        logger.info(`Cache HIT for ${key}`);
        res.setHeader('Content-Type', 'application/json');
        return res.send(cachedBody);
      } else {
        logger.info(`Cache MISS for ${key}`);
        
        // Override res.json to intercept and cache the response body
        const originalJson = res.json.bind(res);
        res.json = (body: any) => {
          redisClient.setEx(key, durationInSeconds, JSON.stringify(body))
            .catch(err => logger.error(`Error caching ${key}:`, err));
          return originalJson(body);
        };
        next();
      }
    } catch (error) {
      logger.error('Cache middleware error', error);
      next();
    }
  };
};

export const clearCache = async (pattern: string) => {
  if (!redisClient.isReady) return;
  try {
    const keys = await redisClient.keys(`__express__${pattern}`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      logger.info(`Cleared ${keys.length} cache keys matching ${pattern}`);
    }
  } catch (error) {
    logger.error('Error clearing cache', error);
  }
};
