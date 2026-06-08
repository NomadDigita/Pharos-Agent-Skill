import { FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { MarketplaceRegistryService } from './registry.service';
import { RegisterAgentSchema, CreateListingSchema } from './registry.schema';
import { Type } from '@sinclair/typebox';

export async function registryRoutes(fastify: FastifyInstance) {
  const provider = fastify.withTypeProvider<TypeBoxTypeProvider>();
  const service = new MarketplaceRegistryService();

  // Register autonomous agent profile
  provider.post('/agents', {
    schema: {
      description: 'Upserts dynamic agent capability descriptors and network service endpoints',
      tags: ['Registry'],
      body: RegisterAgentSchema,
      response: {
        201: Type.Any()
      }
    }
  }, async (request, reply) => {
    const agent = await service.registerAgent(request.body);
    return reply.status(201).send(agent);
  });

  // Create marketplace service listing
  provider.post('/listings', {
    schema: {
      description: 'Publishes a priced capability listing onto the global registry',
      tags: ['Registry'],
      body: CreateListingSchema,
      response: {
        201: Type.Any()
      }
    }
  }, async (request, reply) => {
    const listing = await service.createListing(request.body);
    return reply.status(201).send(listing);
  });

  // Search agents by capability
  provider.get('/search', {
    schema: {
      description: 'Filters registered active nodes holding specific capability tags',
      tags: ['Registry'],
      querystring: Type.Object({
        capability: Type.String()
      }),
      response: {
        200: Type.Any()
      }
    }
  }, async (request, reply) => {
    const agents = await service.searchAgents(request.query.capability);
    return reply.status(200).send(agents);
  });

  // Get active listings
  provider.get('/listings', {
    schema: {
      description: 'Fetches all active payable service listings on the marketplace',
      tags: ['Registry'],
      response: {
        200: Type.Any()
      }
    }
  }, async (request, reply) => {
    const listings = await service.getActiveListings();
    return reply.status(200).send(listings);
  });
}