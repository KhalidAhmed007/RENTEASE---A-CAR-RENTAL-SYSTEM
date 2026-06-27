import rateLimit from 'express-rate-limit';
import { AppError } from './errorMiddleware';

export const adminActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  handler: (req, res, next) => {
    next(new AppError(429, 'Too many requests, please try again later.'));
  }
});
