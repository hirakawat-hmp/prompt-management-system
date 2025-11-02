/**
 * Prisma Client singleton instance
 *
 * Shares the same SQLite database (mastra.db) with Mastra framework.
 * This database contains:
 * - Mastra tables: mastra_messages, mastra_threads, etc. (auto-managed)
 * - Application tables: Project, Prompt, Asset (Prisma-managed)
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
