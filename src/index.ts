import fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from './config/env';
import { logger } from './utils/logger';
import { connectDatabase } from './config/db';
import { initSentry } from './utils/sentry';
import { paymentRoutes } from './modules/payment/payment.routes';
import { registryRoutes } from './modules/registry/registry.routes';
import { walletRoutes } from './modules/wallet/wallet.routes';
import { reputationRoutes } from './modules/reputation/reputation.routes';
import { socialRoutes } from './modules/social/social.routes';
import { registerMCPEndpoints } from './mcp/server';

async function bootstrap() {
  // 1. Initialize Telemetry and Monitoring
  initSentry();

  // 2. Instantiate Fastify Server
  const server = fastify({
    logger: false, // We use our custom Pino logger instead
    ajv: {
      customOptions: {
        coerceTypes: 'array', // Enable clean array parsing for query queries
        removeAdditional: true, // Safeguard parameters
        useDefaults: true
      }
    }
  });

  // 3. Register CORS middleware
  await server.register(cors, {
    origin: true // Enable cross-origin agent invocations safely
  });

  // 4. Configure Swagger (OpenAPI) schemas for self-documenting agent access
  await server.register(swagger, {
    openapi: {
      info: {
        title: 'Pharos Agent Skills API',
        description: 'Production-ready payment execution and marketplace capability registry skills for autonomous agents.',
        version: '1.0.0'
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`, // Explicitly target localhost to prevent CORS browser blocks
          description: 'Local Development Server'
        }
      ]
    }
  });

  await server.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    }
  });

  // 5. Establish Supabase Database Connection
  await connectDatabase();

  // 6. Register Composable Modules & MCP Interface
  await server.register(paymentRoutes, { prefix: '/api/v1/payments' });
  await server.register(registryRoutes, { prefix: '/api/v1/registry' });
  await server.register(walletRoutes, { prefix: '/api/v1/wallet' });
  await server.register(reputationRoutes, { prefix: '/api/v1/reputation' });
  await server.register(socialRoutes, { prefix: '/api/v1/social' });
  await registerMCPEndpoints(server); // Sets up /mcp/sse and /mcp/messages

  // 7. Establish Global Healthcheck Route
  server.get('/health', async () => {
    return { status: 'OK', network: 'Pharos Atlantic Testnet', chainId: env.PHAROS_CHAIN_ID };
  });

  // 8. Server Startup
  try {
    await server.listen({ port: Number(env.PORT), host: env.HOST });
    logger.info(`🚀 Fastify Agent Server listening on http://${env.HOST}:${env.PORT}`);
    logger.info(`📖 Interactive API Specifications available at http://${env.HOST}:${env.PORT}/documentation`);
  } catch (err) {
    logger.error(err, 'Failed to boot Fastify server');
    process.exit(1);
  }

  // 9. Graceful Shutdown Management
  const shutdown = async () => {
    logger.info('Shutting down server safely...');
    await server.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap();