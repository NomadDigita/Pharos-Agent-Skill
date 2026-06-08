import { PaymentExecutionService } from '../modules/payment/payment.service';
import { MarketplaceRegistryService } from '../modules/registry/registry.service';
import { WalletIntelligenceService } from '../modules/wallet/wallet.service';
import { ReputationService } from '../modules/reputation/reputation.service';
import { SocialIntelligenceService } from '../modules/social/social.service';
import { logger } from '../utils/logger';

const paymentService = new PaymentExecutionService();
const registryService = new MarketplaceRegistryService();
const walletService = new WalletIntelligenceService();
const reputationService = new ReputationService();
const socialService = new SocialIntelligenceService();

// 1. Declare the tools that AI Agents can discover
export const MCP_TOOLS_DECLARATIONS = [
  {
    name: 'pharos_create_payment_intent',
    description: 'Prepares a payment record on the Pharos network. Use this when an agent needs to pay another agent or buy a capability. Supports Split payments and Subscriptions.',
    inputSchema: {
      type: 'object',
      properties: {
        listingId: { type: 'string', description: 'Optional ID of the marketplace listing' },
        senderAddress: { type: 'string', description: 'On-chain address of the payer wallet' },
        recipientAddress: { type: 'string', description: 'On-chain address of the payee wallet' },
        amount: { type: 'string', description: 'Amount to pay in ether unit representation (e.g. "0.05")' },
        tokenAddress: { type: 'string', description: 'Optional ERC-20 token address (omit for native PROS)' },
        type: { type: 'string', enum: ['DIRECT', 'ESCROW', 'SPLIT', 'SUBSCRIPTION'], description: 'Payment layout type' },
        splitRecipients: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              address: { type: 'string' },
              percentage: { type: 'number' }
            },
            required: ['address', 'percentage']
          },
          description: 'Allocations for Split transfers (must sum to 100%)'
        },
        subscriptionInterval: { type: 'string', enum: ['WEEKLY', 'MONTHLY'], description: 'Billing interval' }
      },
      required: ['senderAddress', 'recipientAddress', 'amount']
    }
  },
  {
    name: 'pharos_confirm_payment',
    description: 'Confirms a broadcasted transaction hash on the Pharos Atlantic Testnet and updates state to CONFIRMED.',
    inputSchema: {
      type: 'object',
      properties: {
        paymentId: { type: 'string', description: 'UUID of the payment intent created earlier' },
        txHash: { type: 'string', description: 'On-chain transaction hash broadcasted to the network' }
      },
      required: ['paymentId', 'txHash']
    }
  },
  {
    name: 'pharos_register_agent',
    description: 'Registers or updates an agent profile in the marketplace registry, announcing its active capabilities to the network.',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'On-chain wallet address representing the agent' },
        name: { type: 'string', description: 'Clean display name of the agent service' },
        description: { type: 'string', description: 'Brief description of the skills provided' },
        capabilities: { type: 'array', items: { type: 'string' }, description: 'Array of skill tags (e.g. ["extraction", "indexing"])' },
        endpoint: { type: 'string', description: 'Optional REST API URI endpoint of this agent' }
      },
      required: ['address', 'name', 'capabilities']
    }
  },
  {
    name: 'pharos_search_agents',
    description: 'Queries the marketplace registry to locate active agents holding specific capability tags.',
    inputSchema: {
      type: 'object',
      properties: {
        capability: { type: 'string', description: 'Capability tag to search for (e.g. "indexing")' }
      },
      required: ['capability']
    }
  },
  {
    name: 'pharos_analyze_wallet',
    description: 'Audits an EVM wallet address to determine native balances, detect Whale designations, and analyze risk portfolios.',
    inputSchema: {
      type: 'object',
      properties: {
        address: { type: 'string', description: 'The 42-character hex wallet address to audit' }
      },
      required: ['address']
    }
  },
  {
    name: 'pharos_get_reputation',
    description: 'Retrieves the complete transaction audit success rates and community rating score of an agent node.',
    inputSchema: {
      type: 'object',
      properties: {
        agentId: { type: 'string', description: 'UUID of the registered agent node' }
      },
      required: ['agentId']
    }
  },
  {
    name: 'pharos_submit_feedback',
    description: 'Submits a rated trust review for an agent node, automatically triggering trustScore recalibrations.',
    inputSchema: {
      type: 'object',
      properties: {
        agentId: { type: 'string', description: 'UUID of the registered agent node' },
        rating: { type: 'number', minimum: 1, maximum: 5, description: '1-5 star rating' },
        comment: { type: 'string', description: 'Optional review comments text' }
      },
      required: ['agentId', 'rating']
    }
  },
  {
    name: 'pharos_analyze_social_trends',
    description: 'Connects directly to Twitter/X to retrieve recent posts, analyzing sentiment, summaries, and trends using Google Gemini.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keyword to search for on X (e.g., "Pharos" or "PROS")' }
      },
      required: ['query']
    }
  }
];

// 2. Handle tool calls routed from the MCP Server
export async function handleMCPToolExecution(name: string, args: any) {
  logger.info({ toolName: name, args }, 'Executing MCP Tool Call');

  try {
    switch (name) {
      case 'pharos_create_payment_intent': {
        const payment = await paymentService.createPaymentIntent(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(payment, null, 2) }]
        };
      }
      case 'pharos_confirm_payment': {
        const result = await paymentService.confirmPayment(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
      }
      case 'pharos_register_agent': {
        const agent = await registryService.registerAgent(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(agent, null, 2) }]
        };
      }
      case 'pharos_search_agents': {
        const agents = await registryService.searchAgents(args.capability);
        return {
          content: [{ type: 'text', text: JSON.stringify(agents, null, 2) }]
        };
      }
      case 'pharos_analyze_wallet': {
        const analysis = await walletService.analyzeWallet(args.address);
        return {
          content: [{ type: 'text', text: JSON.stringify(analysis, null, 2) }]
        };
      }
      case 'pharos_get_reputation': {
        const profile = await reputationService.getReputation(args.agentId);
        return {
          content: [{ type: 'text', text: JSON.stringify(profile, null, 2) }]
        };
      }
      case 'pharos_submit_feedback': {
        const result = await reputationService.submitFeedback(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
      }
      case 'pharos_analyze_social_trends': {
        const analysis = await socialService.analyzeTrends(args.query);
        return {
          content: [{ type: 'text', text: JSON.stringify(analysis, null, 2) }]
        };
      }
      default:
        throw new Error(`Tool not found: ${name}`);
    }
  } catch (error: any) {
    logger.error({ error, toolName: name }, 'MCP Tool call execution failed');
    return {
      isError: true,
      content: [{ type: 'text', text: `Execution failed: ${error.message || error}` }]
    };
  }
}