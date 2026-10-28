import type { AnalysisRequest, AnalysisResult } from './bpmAnalysis.types';
import { takeWebAnalysisSamples } from './webAudioDecode';

export const ANALYZER_ID = 'web-acf-v1';
export const ANALYZER_VERSION = 1;

interface WorkerResult {
  detectedBpm: number;
  confidence: number;
  confidenceBand: 'high' | 'medium' | 'low';
  tempoModel: 'constant' | 'variable';
  bpmAlternatives: AnalysisResult['bpmAlternatives'];
  suggestedAnchorMs: number;
}

type WorkerResponse =
  | { type: 'progress'; fraction: number }
  | { type: 'result'; result: WorkerResult | null }
  | { type: 'error'; message: string };

const abortError = (): Error => {
  const error = new Error('BPM analysis was cancelled');
  error.name = 'AbortError';
  return error;
};

export async function analyzeBpm(request: AnalysisRequest): Promise<AnalysisResult | null> {
  if (request.signal?.aborted) throw abortError();
  const decoded = await takeWebAnalysisSamples(request.audioUri);
  if (request.signal?.aborted) throw abortError();

  return new Promise<AnalysisResult | null>((resolve, reject) => {
    const worker = new Worker(new URL('./bpmAnalysis.worker', window.location.href));
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      request.signal?.removeEventListener('abort', abort);
      worker.terminate();
      callback();
    };
    const abort = () => finish(() => reject(abortError()));
    request.signal?.addEventListener('abort', abort, { once: true });
    if (request.signal?.aborted) {
      abort();
      return;
    }

    worker.onerror = event => finish(() => reject(new Error(event.message)));
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      if (message.type === 'progress') {
        request.onProgress?.(message.fraction);
        return;
      }
      if (message.type === 'error') {
        finish(() => reject(new Error(message.message)));
        return;
      }
      finish(() => resolve(message.result ? {
        ...message.result,
        analyzerId: ANALYZER_ID,
        analyzerVersion: ANALYZER_VERSION,
        audioFingerprint: request.audioFingerprint,
        analyzedAt: new Date().toISOString(),
      } : null));
    };

    worker.postMessage({
      type: 'analyze',
      samples: decoded.analysisSamples.buffer,
      sampleRate: decoded.analysisSampleRate,
      durationMs: decoded.durationMs,
      minBpm: request.minBpm ?? 40,
      maxBpm: request.maxBpm ?? 220,
      windows: request.windows,
    }, [decoded.analysisSamples.buffer]);
  });
}
