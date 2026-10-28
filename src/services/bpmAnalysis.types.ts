/** Describes whether one representative tempo fits the analyzed windows. */
export type TempoModel = 'constant' | 'variable';

/** Coarse confidence label used by suggestion surfaces. */
export type ConfidenceBand = 'high' | 'medium' | 'low';

/** One selectable tempo interpretation returned by an analyzer. */
export interface BpmAlternative {
  bpm: number;
  likelihood: number;
  relation: 'primary' | 'half' | 'double' | 'other';
}

/** Immutable output from one successful provider analysis. */
export interface AnalysisResult {
  detectedBpm: number;
  confidence: number;
  confidenceBand: ConfidenceBand;
  tempoModel: TempoModel;
  bpmAlternatives: BpmAlternative[];
  suggestedAnchorMs: number;
  detectedBeatTimes?: number[];
  suggestedDownbeatMs?: number;
  downbeatConfidence?: number;
  analyzerId: string;
  analyzerVersion: number;
  audioFingerprint: string;
  analyzedAt: string;
}

/** A bounded region of audio requested for one analysis purpose. */
export interface AnalysisWindow {
  startMs: number;
  durationMs: number;
  purpose: 'tempo' | 'anchor' | 'downbeat';
}

/** Provider-neutral request for local tempo and beat-phase analysis. */
export interface AnalysisRequest {
  audioUri: string;
  audioFingerprint: string;
  minBpm?: number;
  maxBpm?: number;
  windows?: AnalysisWindow[];
  signal?: AbortSignal;
  onProgress?: (fraction: number) => void;
}

/** Platform provider boundary for automatic BPM analysis. */
export interface BpmAnalysisProvider {
  analyze(request: AnalysisRequest): Promise<AnalysisResult | null>;
}
