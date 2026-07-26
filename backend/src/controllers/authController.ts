import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { authService } from '../services/authService';
import { jwtHelper } from '../utils/jwtHelper';
import { ApiResponse } from '../utils/ApiResponse';
import { env } from '../config/env';
import { AppError } from '../middlewares/errorMiddleware';

const sendTokenResponse = (user: any, statusCode: number, res: Response, message: string) => {
  const accessToken = jwtHelper.generateAccessToken(user._id, user.role);
  const refreshToken = jwtHelper.generateRefreshToken(user._id, user.role);

  // SameSite=Lax works in all cases now because the Next.js rewrite on Vercel
  // proxies /api/v1/* server-side — the browser only ever talks to the Vercel
  // domain, so cookies are always same-site (never cross-domain).
  const isProd = env.nodeEnv === 'production';
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.status(statusCode)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json(
      new ApiResponse(statusCode, {
        user: {
          id: user._id,
          firstName: user.firstName,
          email: user.email,
          role: user.role
        },
        accessToken 
      }, message)
    );
};

export const register = catchAsync(async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  res.status(201).json(
    new ApiResponse(201, { email: user.email }, 'Registration successful. Please log in.')
  );
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.login(email, password);
  sendTokenResponse(user, 200, res, 'Login successful');
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  const isProd = env.nodeEnv === 'production';
  res.cookie('refreshToken', 'none', {
    maxAge: 0,
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
  });
  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken || refreshToken === 'none') {
    throw new AppError(401, 'No refresh token found. Please log in again.');
  }

  try {
    const decoded = jwtHelper.verifyRefreshToken(refreshToken);
    const newAccessToken = jwtHelper.generateAccessToken(decoded.id, decoded.role);
    
    res.status(200).json(new ApiResponse(200, { accessToken: newAccessToken }, 'Token refreshed'));
  } catch (error) {
    throw new AppError(401, 'Invalid refresh token. Please log in again.');
  }
});
