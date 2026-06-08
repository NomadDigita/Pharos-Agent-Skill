import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { PaymentExecutionService } from './payment.service';
import { CreatePaymentIntentSchema, BroadcastPaymentSchema } from './payment.schema';
import { Type } from '@sinclair/typebox';

export async function paymentRoutes(fastify: FastifyInstance) {
  const provider = fastify.withTypeProvider<TypeBoxTypeProvider>();
  const service = new PaymentExecutionService();

  // Create payment intent
  provider.post('/intent', {
    schema: {
      description: 'Generates a payment tracking intent record prior to on-chain signing and broadcast',
      tags: ['Payments'],
      body: CreatePaymentIntentSchema
    }
  }, async (request, reply) => {
    const payment = await service.createPaymentIntent(request.body);
    return reply.status(201).send(payment);
  });

  // Confirm and verify on-chain broadcasted payment
  provider.post('/confirm', {
    schema: {
      description: 'Polls the Pharos Testnet RPC node to verify block confirmation and transaction logs of the given hash',
      tags: ['Payments'],
      body: BroadcastPaymentSchema
    }
  }, async (request, reply) => {
    const payment = await service.confirmPayment(request.body);
    return reply.status(200).send(payment);
  });

  // Get status of specific payment
  provider.get('/:id', {
    schema: {
      description: 'Fetch complete state and audit history for a specific execution identifier',
      tags: ['Payments'],
      params: Type.Object({
        id: Type.String({ format: 'uuid' })
      })
    }
  }, async (request, reply) => {
    const payment = await service.getPaymentStatus(request.params.id);
    if (!payment) {
      return reply.status(404).send({ error: 'Payment record not found' });
    }
    return reply.status(200).send(payment);
  });
}