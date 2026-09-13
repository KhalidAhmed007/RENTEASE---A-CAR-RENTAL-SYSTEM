import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import logger from '../utils/logger';
import { Prisma } from '@prisma/client';

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
    // ── Prisma: Unique constraint violation (P2002) ────────────────────────
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      statusCode = 400;
      const fields = (err.meta?.target as string[]) ?? [];
      const field  = fields[0] ?? 'field';
      message = `An account with this ${field} already exists.`;
      logger.warn(`[Error Handler] Unique constraint: ${message}`);

    // ── Prisma: Record not found (P2025) ──────────────────────────────────
    } else if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
      logger.warn(`[Error Handler] Record not found: ${err.meta?.cause}`);

    // ── Prisma: Foreign key constraint (P2003) ────────────────────────────
    } else if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      statusCode = 400;
      message = 'Related record not found';
      logger.warn(`[Error Handler] FK constraint: ${err.meta?.field_name}`);

    // ── Prisma: Validation error ──────────────────────────────────────────
    } else if (err instanceof Prisma.PrismaClientValidationError) {
      statusCode = 400;
      message = 'Invalid data provided';
      logger.warn(`[Error Handler] Prisma validation: ${err.message}`);

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
