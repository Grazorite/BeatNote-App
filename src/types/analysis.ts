import { AnalysisResult } from '../services/bpmAnalysis.types';

/** Latest reusable raw analysis for one durable Music Item. */
export interface AnalysisCacheEntry {
  schemaVersion: 1;
  musicItemId: string;
  result: AnalysisResult;
}

export type AnalysisJobStatus = 'queued' | 'running' | 'success' | 'unavailable'
  | 'cancelled' | 'failed';

/** Session-only analyzer state mirrored into the studio store. */
export interface AnalysisJobView {
  musicItemId: string;
  status: AnalysisJobStatus;
  progress: number;
  result: AnalysisResult | null;
  error: string | null;
}
