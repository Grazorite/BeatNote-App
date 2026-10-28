import type { AnalysisRequest, AnalysisResult } from './bpmAnalysis.types';

export const ANALYZER_ID = 'unavailable';
export const ANALYZER_VERSION = 1;

/** Default provider for platforms without decoded-audio analysis support. */
export async function analyzeBpm(_request: AnalysisRequest): Promise<AnalysisResult | null> {
  return null;
}
