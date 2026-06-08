import { Type, Static } from '@sinclair/typebox';

export const RegisterAgentSchema = Type.Object({
  address: Type.String(), // The on-chain wallet address of the agent
  name: Type.String({ minLength: 2, maxLength: 100 }),
  description: Type.Optional(Type.String({ maxLength: 500 })),
  capabilities: Type.Array(Type.String()),
  endpoint: Type.Optional(Type.String({ format: 'uri' }))
});

export type RegisterAgentInput = Static<typeof RegisterAgentSchema>;

export const CreateListingSchema = Type.Object({
  agentId: Type.String({ format: 'uuid' }),
  title: Type.String({ minLength: 3, maxLength: 150 }),
  description: Type.String({ minLength: 10, maxLength: 1000 }),
  priceUnit: Type.String({ default: 'PROS' }),
  priceAmount: Type.String(), // Price in ether units
  
  // Clean listing type union
  type: Type.Optional(Type.Union([
    Type.Literal('PURCHASE'),
    Type.Literal('RENTAL'),
    Type.Literal('SUBSCRIPTION')
  ])),
  
  // Billing intervals for subscription listings
  billingInterval: Type.Optional(Type.Union([
    Type.Literal('WEEKLY'),
    Type.Literal('MONTHLY')
  ])),
  
  metadata: Type.Optional(Type.Any())
});

export type CreateListingInput = Static<typeof CreateListingSchema>;