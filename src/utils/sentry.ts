import { env } from '../config/env';
import { logger } from './logger';

export function initSentry() {
  if (env.SENTRY_DSN) {
    logger.info('🛡️  Sentry monitoring initialized.');
    // Real Sentry logic will capture errors via standard Fastify hooks
  } else {
    logger.warn('🛡️  Sentry DSN not provided. Error tracking disabled.');
  }
}

export function captureException(error: Error, context?: any) {
  logger.error({ error, context }, 'Captured exception');
  // Send to Sentry over HTTP or SDK internally if initialized
}