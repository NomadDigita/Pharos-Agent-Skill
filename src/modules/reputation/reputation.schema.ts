import { Type, Static } from '@sinclair/typebox';

export const SubmitFeedbackSchema = Type.Object({
  agentId: Type.String({ format: 'uuid' }),
  rating: Type.Number({ minimum: 1, maximum: 5 }), // 1 to 5 star scale
  comment: Type.Optional(Type.String({ maxLength: 300 }))
});

export type SubmitFeedbackInput = Static<typeof SubmitFeedbackSchema>;