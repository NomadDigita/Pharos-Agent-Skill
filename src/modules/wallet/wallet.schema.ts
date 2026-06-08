import { Type, Static } from '@sinclair/typebox';

export const AnalyzeWalletSchema = Type.Object({
  address: Type.String({ minLength: 42, maxLength: 42 }) // Validates EVM address string length
});

export type AnalyzeWalletInput = Static<typeof AnalyzeWalletSchema>;