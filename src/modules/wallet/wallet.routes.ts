import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { WalletIntelligenceService } from './wallet.service';
import { AnalyzeWalletSchema } from './wallet.schema';
import { Type } from '@sinclair/typebox';

export async function walletRoutes(fastify: FastifyInstance) {
  const provider = fastify.withTypeProvider<TypeBoxTypeProvider>();
  const service = new WalletIntelligenceService();

  // Analyze wallet portfolio and behavior
  provider.post('/analyze', {
    schema: {
      description: 'Audit any EVM wallet portfolio, detect whale flags, calculate estimated PnL, and analyze spam risk properties',
      tags: ['Wallet Intelligence'],
      body: AnalyzeWalletSchema,
      response: {
        200: Type.Any()
      }
    }
  }, async (request, reply) => {
    const analysis = await service.analyzeWallet(request.body.address);
    return reply.status(200).send(analysis);
  });
}