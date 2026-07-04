/**
 * Singleton PrismaClient.
 * A single connection pool is shared across the process; in dev we cache it on
 * `globalThis` so hot-reload (tsx watch) doesn't exhaust connections.
 */
import { PrismaClient } from '@prisma/client';
import { isProd } from './env';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ['error'] : ['query', 'warn', 'error'],
  });

if (!isProd) globalForPrisma.prisma = prisma;
