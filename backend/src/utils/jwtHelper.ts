import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Types } from 'mongoose';

export interface TokenPayload {
  id: string;
  role: string;
}

export const jwtHelper = {
  generateAccessToken(userId: Types.ObjectId | string, role: string): string {
    return jwt.sign(
      { id: userId.toString(), role },
      env.jwt.accessSecret,
      { expiresIn: env.jwt.accessExpiration as jwt.SignOptions['expiresIn'] }
    );
  },

  generateRefreshToken(userId: Types.ObjectId | string, role: string): string {
    return jwt.sign(
      { id: userId.toString(), role },
      env.jwt.refreshSecret,
      { expiresIn: env.jwt.refreshExpiration as jwt.SignOptions['expiresIn'] }
    );
  },

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.jwt.accessSecret) as TokenPayload;
  },

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, env.jwt.refreshSecret) as TokenPayload;
  }
};
