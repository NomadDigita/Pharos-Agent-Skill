import { Type, Static } from '@sinclair/typebox';

export const AnalyzeSocialTrendsSchema = Type.Object({
  query: Type.String({ minLength: 2, maxLength: 50 }) // e.g., "Pharos" or "PROS"
});

export type AnalyzeSocialTrendsInput = Static<typeof AnalyzeSocialTrendsSchema>;