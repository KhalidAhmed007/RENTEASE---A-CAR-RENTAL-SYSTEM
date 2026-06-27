import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import logger from '../utils/logger';

export class AppError extends Error {
  constructor(public statusCode: number, public message: string, public isOperational = true) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const globalErrorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err instanceof AppError ? err.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  if (!(err instanceof AppError)) {
    // Handle MongoDB Duplicate Key Error (E11000)
    if ((err as any).code === 11000) {
      statusCode = 400;
      const field = Object.keys((err as any).keyValue)[0];
      message = `An account with this ${field} already exists.`;
      logger.warn(`[Error Handler] Duplicate Field: ${message}`);
    } else {
      logger.error(`[Error Handler] Unhandled Exception: ${message}`, err.stack);
    }
  } else {
    logger.warn(`[Error Handler] AppError: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.nodeEnv === 'development' && { stack: err.stack }),
  });
};
