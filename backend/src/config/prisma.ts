
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  // Preserve Neon SSL parameters and add Prisma connection-pool settings.
  const url = new URL(databaseUrl);

  url.searchParams.set('connection_limit', '5');
  url.searchParams.set('connect_timeout', '10');
  url.searchParams.set('pool_timeout', '10');

  const client = new PrismaClient({
    log: [
      { level: 'warn', emit: 'event' },
      { level: 'error', emit: 'event' },
    ],
    datasources: {
      db: {
        url: url.toString(),
      },
    },
  });

  client.$on('warn' as never, (e: any) =>
    logger.warn(`[Prisma] ${e.message}`)
  );

  client.$on('error' as never, (e: any) =>
    logger.error(`[Prisma] ${e.message}`)
  );

  return client;
}

export const prisma: PrismaClient =
  globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;
