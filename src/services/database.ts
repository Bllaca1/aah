import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient singleton instance to ensure only one client is created
 * for the application lifetime. This prevents connection pool exhaustion
 * in development with hot reloading.
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Gracefully disconnect from database on application shutdown
 */
export async function disconnectDatabase() {
  await prisma.$disconnect();
}

/**
 * Check database connection health
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Export types for convenience
export type { Prisma } from '@prisma/client';
export * from '@prisma/client';

export default prisma;
