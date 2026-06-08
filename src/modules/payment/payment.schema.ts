import { Type, Static } from '@sinclair/typebox';

export const CreatePaymentIntentSchema = Type.Object({
  listingId: Type.Optional(Type.String({ format: 'uuid' })),
  senderAddress: Type.String(),
  recipientAddress: Type.String(),
  amount: Type.String(),
  tokenAddress: Type.Optional(Type.String()),
  
  // Clean string union definition
  type: Type.Optional(Type.Union([
    Type.Literal('DIRECT'),
    Type.Literal('ESCROW'),
    Type.Literal('SPLIT'),
    Type.Literal('SUBSCRIPTION')
  ])),
  
  // Split payment recipient array schema
  splitRecipients: Type.Optional(Type.Array(
    Type.Object({
      address: Type.String(),
      percentage: Type.Number({ minimum: 1, maximum: 100 })
    })
  )),
  
  // Subscription parameters
  subscriptionInterval: Type.Optional(Type.Union([
    Type.Literal('WEEKLY'),
    Type.Literal('MONTHLY')
  ])),
  
  escrowReleaseKey: Type.Optional(Type.String()),
  expiresInSeconds: Type.Optional(Type.Number({ default: 86400 }))
});

export type CreatePaymentIntentInput = Static<typeof CreatePaymentIntentSchema>;

export const BroadcastPaymentSchema = Type.Object({
  paymentId: Type.String({ format: 'uuid' }),
  txHash: Type.String()
});

export type BroadcastPaymentInput = Static<typeof BroadcastPaymentSchema>;