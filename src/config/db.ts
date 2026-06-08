import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'info' },
    { emit: 'stdout', level: 'warn' },
  ],
});

(prisma as any).$on('query', (e: any) => {
  logger.debug({ query: e.query, params: e.params, duration: `${e.duration}ms` }, 'Prisma Query');
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('🔌 Connection to PostgreSQL (Supabase) verified.');
  } catch (error) {
    logger.error({ error }, '❌ Database connection failed.');
    process.exit(1);
  }
}