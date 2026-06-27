import mongoose from 'mongoose';
import { env } from './env';
import logger from '../utils/logger';

const ATLAS_OPTIONS: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  // Atlas SRV connections handle TLS automatically via the driver.
  // Explicitly setting tls:true with tlsAllowInvalidCertificates:false
  // can cause handshake failures on some networks/Node versions.
  // Let the driver auto-negotiate TLS from the mongodb+srv:// scheme.
  family: 4, // Force IPv4 — avoids IPv6 DNS resolution delays on Windows
};

const LOCAL_OPTIONS: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 5000,
};

export const connectDB = async () => {
  // Sanitize URI for logging (hide password)
  const sanitizedUri = env.mongoUri.replace(/:([^@]+)@/, ':****@');
  logger.info(`Attempting MongoDB Atlas connection to: ${sanitizedUri}`);

  try {
    const conn = await mongoose.connect(env.mongoUri, ATLAS_OPTIONS);
    logger.info(`Primary MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error connecting to Primary MongoDB Atlas: ${(error as Error).message}`);
    logger.info(`Falling back to local MongoDB...`);
    try {
      const fallbackConn = await mongoose.connect(
        'mongodb://127.0.0.1:27017/car_rental_system',
        LOCAL_OPTIONS
      );
      logger.info(`Fallback Local MongoDB Connected: ${fallbackConn.connection.host}`);
    } catch (fallbackError) {
      logger.error(`Fallback Local MongoDB failed: ${(fallbackError as Error).message}`);
      logger.error('CRITICAL: Cannot connect to any database.');
      process.exit(1);
    }
  }
};
