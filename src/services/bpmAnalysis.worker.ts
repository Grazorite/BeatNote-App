import { detectBpm, type BpmDetectorResult } from './bpmAnalysis.detector';
import type { AnalysisWindow, BpmAlternative, TempoModel } from './bpmAnalysis.types';

interface WorkerRequest {
  type: 'analyze';
  samples: ArrayBuffer;
  sampleRate: number;
  durationMs: number;
  minBpm: number;
  maxBpm: number;
  windows?: AnalysisWindow[];
}

type WorkerResponse =
  | { type: 'progress'; fraction: number }
  | { type: 'result'; result: Omit<BpmDetectorResult, 'found' | 'analyzerId' | 'analyzerVersion'> | null }
  | { type: 'error'; message: string };

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage: (message: WorkerResponse) => void;
};

const defaultWindows = (durationMs: number): AnalysisWindow[] => {
  if (durationMs < 90_000) {
    return [{ startMs: 0, durationMs, purpose: 'tempo' }];
  }
  return [
    { startMs: 0, durationMs: Math.min(30_000, durationMs), purpose: 'anchor' },
    ...[0.25, 0.5, 0.75].map(fraction => ({
      startMs: Math.max(0, Math.min(durationMs - 20_000, durationMs * fraction - 10_000)),
      durationMs: 20_000,
      purpose: 'tempo' as const,
    })),
  ];
};

const sliceWindow = (
  samples: Float32Array,
  sampleRate: number,
  window: AnalysisWindow,
): Float32Array => {
  const start = Math.max(0, Math.floor(window.startMs * sampleRate / 1_000));
  const end = Math.min(
    samples.length,
    Math.ceil((window.startMs + window.durationMs) * sampleRate / 1_000),
  );
  return samples.subarray(start, Math.max(start, end));
};

const median = (values: number[]): number => {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

const alternativesFor = (
  bpm: number,
  confidence: number,
  minBpm: number,
  maxBpm: number,
): BpmAlternative[] => {
  const alternatives: BpmAlternative[] = [{ bpm, likelihood: confidence, relation: 'primary' }];
  if (bpm / 2 >= minBpm) {
    alternatives.push({ bpm: bpm / 2, likelihood: confidence * 0.55, relation: 'half' });
  }
  if (bpm * 2 <= maxBpm) {
    alternatives.push({ bpm: bpm * 2, likelihood: confidence * 0.55, relation: 'double' });
  }
  return alternatives;
};

const combine = (
  estimates: Array<{ result: BpmDetectorResult; window: AnalysisWindow }>,
  minBpm: number,
  maxBpm: number,
): Omit<BpmDetectorResult, 'found' | 'analyzerId' | 'analyzerVersion'> | null => {
  if (estimates.length === 0) return null;
  const tempoEstimates = estimates.filter(estimate => estimate.window.purpose === 'tempo');
  const tempoSource = tempoEstimates.length > 0 ? tempoEstimates : estimates;
  const detectedBpm = Math.round(median(tempoSource.map(({ result }) => result.detectedBpm)) * 100) / 100;
  const maximumDrift = Math.max(...tempoSource.map(({ result }) => (
    Math.abs(result.detectedBpm - detectedBpm) / Math.max(detectedBpm, 1)
  )));
  const tempoModel: TempoModel = maximumDrift > 0.04 ? 'variable' : 'constant';
  const meanConfidence = tempoSource.reduce((sum, { result }) => sum + result.confidence, 0)
    / tempoSource.length;
  const confidence = Math.max(0, Math.min(1, meanConfidence * (tempoModel === 'variable' ? 0.65 : 1)));
  const anchorEstimate = estimates.find(estimate => estimate.window.purpose === 'anchor') ?? estimates[0];
  const suggestedAnchorMs = anchorEstimate.window.startMs + anchorEstimate.result.suggestedAnchorMs;

  return {
    detectedBpm,
    confidence,
    confidenceBand: confidence >= 0.75 ? 'high' : confidence >= 0.45 ? 'medium' : 'low',
    tempoModel,
    bpmAlternatives: alternativesFor(detectedBpm, confidence, minBpm, maxBpm),
    suggestedAnchorMs,
  };
};

workerScope.onmessage = event => {
  if (event.data.type !== 'analyze') return;
  try {
    const { sampleRate, durationMs, minBpm, maxBpm } = event.data;
    const samples = new Float32Array(event.data.samples);
    const windows = event.data.windows?.length ? event.data.windows : defaultWindows(durationMs);
    const estimates: Array<{ result: BpmDetectorResult; window: AnalysisWindow }> = [];

    windows.forEach((window, index) => {
      const result = detectBpm(sliceWindow(samples, sampleRate, window), {
        sampleRate,
        minBpm,
        maxBpm,
      });
      if (result.found) estimates.push({ result, window });
      workerScope.postMessage({ type: 'progress', fraction: (index + 1) / windows.length });
    });

    workerScope.postMessage({ type: 'result', result: combine(estimates, minBpm, maxBpm) });
  } catch (error) {
    workerScope.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Unknown BPM analysis error',
    });
  }
};
