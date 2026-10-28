import BeatNoteTempo from '../../modules/beatnote-tempo/src';
import type { AnalysisRequest, AnalysisResult } from './bpmAnalysis.types';

export const ANALYZER_ID = 'ios-accelerate-v1';
export const ANALYZER_VERSION = 1;

const abortError = (): Error => {
  const error = new Error('BPM analysis was cancelled');
  error.name = 'AbortError';
  return error;
};

export async function analyzeBpm(request: AnalysisRequest): Promise<AnalysisResult | null> {
  if (request.signal?.aborted) throw abortError();

  const requestId = `tempo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const progressSubscription = BeatNoteTempo.addListener('onAnalysisProgress', event => {
    if (event.requestId === requestId) request.onProgress?.(event.fraction);
  });
  const abort = () => BeatNoteTempo.cancelAnalysis(requestId);
  request.signal?.addEventListener('abort', abort, { once: true });

  try {
    const result = await BeatNoteTempo.analyzeTempoAsync(
      request.audioUri,
      requestId,
      request.minBpm ?? 40,
      request.maxBpm ?? 220,
    );
    if (request.signal?.aborted) throw abortError();
    request.onProgress?.(1);
    return {
      ...result,
      analyzerId: ANALYZER_ID,
      analyzerVersion: ANALYZER_VERSION,
      audioFingerprint: request.audioFingerprint,
      analyzedAt: new Date().toISOString(),
    };
  } catch (error) {
    if (request.signal?.aborted) throw abortError();
    throw error;
  } finally {
    request.signal?.removeEventListener('abort', abort);
    progressSubscription.remove();
  }
}
