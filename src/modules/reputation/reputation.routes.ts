import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { ReputationService } from './reputation.service';
import { SubmitFeedbackSchema } from './reputation.schema';
import { Type } from '@sinclair/typebox';

export async function reputationRoutes(fastify: FastifyInstance) {
  const provider = fastify.withTypeProvider<TypeBoxTypeProvider>();
  const service = new ReputationService();

  // Submit agent review feedback
  provider.post('/feedback', {
    schema: {
      description: 'Submit rated trust feedback for an agent, automatically triggering weighted trustScore recalculations',
      tags: ['Reputation'],
      body: SubmitFeedbackSchema,
      response: {
        200: Type.Any()
      }
    }
  }, async (request, reply) => {
    const profile = await service.submitFeedback(request.body);
    return reply.status(200).send(profile);
  });

  // Get agent reputation profile
  provider.get('/:agentId', {
    schema: {
      description: 'Fetches the transaction-audit and community rating reputation history for an agent',
      tags: ['Reputation'],
      params: Type.Object({
        agentId: Type.String({ format: 'uuid' })
      }),
      response: {
        200: Type.Any()
      }
    }
  }, async (request, reply) => {
    const profile = await service.getReputation(request.params.agentId);
    return reply.status(200).send(profile);
  });

  // Synchronize dynamic transaction reputation metrics
  provider.post('/sync/:agentId', {
    schema: {
      description: 'Audits transaction success and failure logs to update the trust score profile',
      tags: ['Reputation'],
      params: Type.Object({
        agentId: Type.String({ format: 'uuid' })
      }),
      response: {
        200: Type.Any()
      }
    }
  }, async (request, reply) => {
    const profile = await service.syncTransactionReputation(request.params.agentId);
    return reply.status(200).send(profile);
  });
}