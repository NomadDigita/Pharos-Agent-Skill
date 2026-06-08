import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { FastifyInstance } from 'fastify';
import { MCP_TOOLS_DECLARATIONS, handleMCPToolExecution } from './tools';
import { logger } from '../utils/logger';

// Initialize the base Model Context Protocol Server
export const mcpServer = new Server(
  {
    name: 'pharos-agent-skills',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Register Tool Discovery Handler
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.debug('MCP Tool list requested');
  return {
    tools: MCP_TOOLS_DECLARATIONS
  };
});

// Register Tool Execution Handler
mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return await handleMCPToolExecution(name, args);
});

/**
 * Registers SSE endpoints to Fastify allowing AI Orchestrators to subscribe to MCP tools.
 */
export async function registerMCPEndpoints(fastify: FastifyInstance) {
  let transport: SSEServerTransport | null = null;

  // SSE initialization endpoint
  fastify.get('/mcp/sse', async (request, reply) => {
    logger.info('🔌 SSE connection initiated by AI Client.');
    
    // Set up SSE transport target
    transport = new SSEServerTransport('/mcp/messages', reply.raw);
    
    // Bind to the shared MCP server instance
    await mcpServer.connect(transport);
  });

  // Client messages post endpoint
  fastify.post('/mcp/messages', async (request, reply) => {
    if (!transport) {
      return reply.status(400).send({ error: 'Active SSE transport has not been established yet' });
    }
    
    logger.debug({ body: request.body }, 'Received incoming MCP message payload');
    
    // Pass the parsed request.body (JSON-RPC message) directly to the transport
    await transport.handleMessage(request.body);
    return reply.status(200).send();
  });
}