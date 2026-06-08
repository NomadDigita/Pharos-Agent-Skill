import { prisma } from '../../config/db';
import { logger } from '../../utils/logger';
import { sendTelegramMessage } from '../../utils/telegram';
import { RegisterAgentInput, CreateListingInput } from './registry.schema';
import { Decimal } from '@prisma/client/runtime/library';
import { ListingType } from '@prisma/client';

export class MarketplaceRegistryService {
  /**
   * Registers or updates an agent node profile.
   */
  async registerAgent(input: RegisterAgentInput) {
    logger.info({ address: input.address }, 'Registering or updating autonomous agent node profile');

    const normalizedAddress = input.address.toLowerCase();

    const agent = await prisma.agentNode.upsert({
      where: { address: normalizedAddress },
      update: {
        name: input.name,
        description: input.description || null,
        capabilities: input.capabilities,
        endpoint: input.endpoint || null
      },
      create: {
        address: normalizedAddress,
        name: input.name,
        description: input.description || null,
        capabilities: input.capabilities,
        endpoint: input.endpoint || null
      }
    });

    // Send Telegram Notification
    await sendTelegramMessage(
      `🤖 <b>New Agent Node Registered</b>\n\n` +
      `<b>Name:</b> <code>${agent.name}</code>\n` +
      `<b>Wallet Address:</b> <code>${agent.address}</code>\n` +
      `<b>Capabilities:</b> <code>${(agent.capabilities as string[]).join(', ')}</code>`
    );

    logger.debug({ agentId: agent.id }, 'Agent profile successfully registered in database');
    return agent;
  }

  /**
   * Publishes a priced capability listing (Supports Purchase, Rental, and Subscriptions).
   */
  async createListing(input: CreateListingInput) {
    logger.info({ agentId: input.agentId }, 'Publishing a service capability listing');

    const agentExists = await prisma.agentNode.findUnique({
      where: { id: input.agentId }
    });

    if (!agentExists) {
      throw new Error(`Agent with ID ${input.agentId} is not registered in this network`);
    }

    const priceDecimal = new Decimal(input.priceAmount);

    const listing = await prisma.marketplaceListing.create({
      data: {
        agentId: input.agentId,
        title: input.title,
        description: input.description,
        priceUnit: input.priceUnit,
        priceAmount: priceDecimal,
        type: (input.type || 'PURCHASE') as ListingType,
        billingInterval: input.billingInterval || null,
        metadata: input.metadata || null
      }
    });

    return listing;
  }

  /**
   * Queries the registry for agents holding specific capabilities.
   */
  async searchAgents(capability: string) {
    logger.debug({ capability }, 'Searching registry for agents matching capability filter');

    const agents = await prisma.agentNode.findMany({
      where: {
        capabilities: {
          array_contains: capability
        },
        status: 'ACTIVE'
      },
      include: {
        listings: {
          where: {
            status: 'ACTIVE'
          }
        }
      }
    });

    return agents;
  }

  /**
   * Returns all active marketplace listings.
   */
  async getActiveListings() {
    return prisma.marketplaceListing.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        agent: true
      }
    });
  }
}