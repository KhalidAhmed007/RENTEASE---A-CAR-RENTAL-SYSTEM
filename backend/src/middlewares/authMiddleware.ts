import { Request, Response, NextFunction } from 'express';
import { jwtHelper, TokenPayload } from '../utils/jwtHelper';
import { AppError } from './errorMiddleware';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const protect = (req: Request, res: Response, next: NextFunction) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError(401, 'Not authorized, please log in'));
  }

  try {
    const decoded = jwtHelper.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError(401, 'Token failed or expired'));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, 'User role not authorized to access this route'));
    }
    next();
  };
};
