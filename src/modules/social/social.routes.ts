import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { SocialIntelligenceService } from './social.service';
import { AnalyzeSocialTrendsSchema } from './social.schema';

export async function socialRoutes(fastify: FastifyInstance) {
  const provider = fastify.withTypeProvider<TypeBoxTypeProvider>();
  const service = new SocialIntelligenceService();

  // Analyze social sentiment
  provider.post('/trends', {
    schema: {
      description: 'Fetch real-time tweets and process them through Gemini AI to summarize market sentiment and trading signals',
      tags: ['Social Intelligence'],
      body: AnalyzeSocialTrendsSchema
    }
  }, async (request, reply) => {
    const analysis = await service.analyzeTrends(request.body.query);
    return reply.status(200).send(analysis);
  });
}