import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import dotenv from 'dotenv';

// Load .env before anything else so DATABASE_URL is available.
dotenv.config();

// Singleton Prisma Client — reuse across the app to avoid connection pool exhaustion.
// In development, attach to globalThis to survive hot-reloads (ts-node-dev).
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const client = new PrismaClient({
    log: [
      { level: 'warn',  emit: 'event' },
      { level: 'error', emit: 'event' },
    ],
    datasources: {
      db: {
        // Append pool tuning & keepalive to prevent Windows WSAECONNRESET (10054).
        // - connection_limit: max simultaneous connections in the pool.
        // - connect_timeout: fail fast instead of hanging 30s.
        // - socket_timeout:  drop stale connections before PG kills them server-side.
        url: process.env.DATABASE_URL
          .replace(/\?.*$/, '') // strip any existing params first
          + '?connection_limit=5&connect_timeout=10&socket_timeout=15&pool_timeout=10',
      },
    },
  });

  // Forward Prisma log events to our Winston logger
  client.$on('warn' as never,  (e: any) => logger.warn(`[Prisma]  ${e.message}`));
  client.$on('error' as never, (e: any) => logger.error(`[Prisma]  ${e.message}`));

  return client;
}

export const prisma: PrismaClient =
  globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;

