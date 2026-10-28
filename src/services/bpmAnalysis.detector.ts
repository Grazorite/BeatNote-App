/**
 * Pure, platform-neutral tempo detector (automatic-bpm-detection Phase 4.1).
 *
 * Synchronous signal-processing core: onset-envelope peak detection followed
 * by autocorrelation of the inter-onset interval histogram. No browser/worker
 * APIs, no external dependencies, no downbeat claim, no persisted beat array.
 */
import type { BpmAlternative, ConfidenceBand, TempoModel } from './bpmAnalysis.types';

export const DETECTOR_ID = 'ac-core-v1';
export const DETECTOR_VERSION = 1;

export interface BpmDetectorParams {
  sampleRate: number;
  minBpm?: number;
  maxBpm?: number;
}

export interface BpmDetectorResult {
  /** True when a usable tempo was found. */
  found: true;
  detectedBpm: number;
  /** Tempo confidence 0..1. */
  confidence: number;
  confidenceBand: ConfidenceBand;
  tempoModel: TempoModel;
  /** Primary plus valid half/double alternatives (Req 8.2). */
  bpmAlternatives: BpmAlternative[];
  /** First usable beat, in milliseconds. */
  suggestedAnchorMs: number;
  analyzerId: string;
  analyzerVersion: number;
}

/** Returned when the input contains no usable tempo (e.g. silence). */
export const BpmDetectRejection = {
  found: false,
  detectedBpm: 0,
  confidence: 0,
  confidenceBand: 'low' as const,
  tempoModel: 'constant' as const,
  bpmAlternatives: [] as BpmAlternative[],
  suggestedAnchorMs: 0,
  analyzerId: DETECTOR_ID,
  analyzerVersion: DETECTOR_VERSION,
};

export type BpmDetection =
  | BpmDetectorResult
  | (typeof BpmDetectRejection & { found: false });

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Build a half-wave-rectified envelope at onset resolution (~5ms bins). */
function buildEnvelope(samples: Float32Array, sampleRate: number): Float32Array {
  const binSamples = Math.max(1, Math.round(sampleRate / 200)); // 5 ms
  const bins = Math.ceil(samples.length / binSamples);
  const env = new Float32Array(bins);
  let maxAmp = 0;

  for (let b = 0; b < bins; b++) {
    const start = b * binSamples;
    const end = Math.min(samples.length, start + binSamples);
    let peak = 0;
    for (let i = start; i < end; i++) {
      const a = Math.abs(samples[i]);
      if (a > peak) peak = a;
    }
    env[b] = peak;
    if (peak > maxAmp) maxAmp = peak;
  }

  if (maxAmp > 1e-6) {
    for (let b = 0; b < bins; b++) env[b] /= maxAmp;
  }
  return env;
}

/**
 * Onset strength: rectified positive envelope change. A leaky gate is
 * intentionally *not* used here — the downstream local-maximum picker plus
 * min-separation already deduplicates, and the gate was killing the first
 * onset in click-test fixtures (the first click resets the gate and is then
 * suppressed by `rise > gate`).
 */
function onsetStrengths(env: Float32Array): Float32Array {
  const n = env.length;
  if (n < 2) {
    return new Float32Array(n);
  }
  const out = new Float32Array(n);
  for (let i = 1; i < n; i++) {
    out[i] = Math.max(0, env[i] - env[i - 1]);
  }
  // Normalise to peak 1 so downstream gating is relative.
  let m = 0;
  for (let i = 1; i < n; i++) if (out[i] > m) m = out[i];
  if (m > 1e-9) {
    for (let i = 1; i < n; i++) out[i] /= m;
  }
  return out;
}

/** Peak-pick onset frames using adaptive mean + σ threshold and min separation. */
function localMaxima(arr: Float32Array, floor: number, minSep: number, cap: number): number[] {
  const n = arr.length;
  const out: { idx: number; v: number }[] = [];
  for (let i = 1; i < n - 1; i++) {
    if (arr[i] >= floor && arr[i] >= arr[i - 1] && arr[i] >= arr[i + 1]) {
      out.push({ idx: i, v: arr[i] });
    }
  }
  out.sort((a, b) => b.v - a.v);
  const kept: number[] = [];
  for (const c of out) {
    if (kept.every((m) => Math.abs(m - c.idx) >= minSep)) kept.push(c.idx);
    if (kept.length >= cap) break;
  }
  kept.sort((a, b) => a - b);
  return kept;
}

/** Peak-pick onset frames using adaptive mean + σ threshold and min separation. */
function pickOnsets(onset: Float32Array, minSeparationFrames: number): number[] {
  const n = onset.length;
  if (n < 3) return [];

  let mean = 0;
  for (let i = 0; i < n; i++) mean += onset[i];
  mean /= n;
  let varSum = 0;
  for (let i = 0; i < n; i++) {
    const d = onset[i] - mean;
    varSum += d * d;
  }
  const sigma = Math.sqrt(varSum / n);

  const high = mean + 2.0 * sigma;
  const low = mean + 1.0 * sigma;
  const threshold = high > 0.15 ? high : Math.max(low, 0.15);

  const separated = Math.max(1, minSeparationFrames);
  const onsets: number[] = [];
  let i = 1;
  while (i < n - 1) {
    if (onset[i] >= threshold && onset[i] >= onset[i - 1] && onset[i] >= onset[i + 1]) {
      onsets.push(i);
      i += separated;
    } else {
      i++;
    }
  }

  // Fallback: if the adaptive gate suppressed onsets (noisy σ or flat click
  // field), keep the top-K local maxima that still exceed a modest floor.
  if (onsets.length < 6) {
    const floor = Math.max(0.1, mean + 0.5 * sigma);
    const merged = localMaxima(onset, floor, separated, 32);
    if (merged.length > onsets.length) return merged;
  }

  return onsets;
}

/**
 * Autocorrelate the onset stream in BPM space over [minBpm, maxBpm].
 * Returns the best period (frames per beat) + confidence + tempoModel.
 */
function correlateTempo(onsets: number[], minBpm: number, maxBpm: number): {
  periodFrames: number | null;
  confidence: number;
  tempoModel: TempoModel;
} {
  const n = onsets.length;
  if (n < 6) return { periodFrames: null, confidence: 0, tempoModel: 'constant' };

  // Frame units are onset-resolution (~5 ms each). The beat period in frames is
  // the number of frames between consecutive beats.
  const minLag = Math.max(1, Math.round((60 * 1000) / maxBpm / 5)); // ~55 frames for 220BPM
  const maxLag = Math.round((60 * 1000) / minBpm / 5); // ~750 frames for 40BPM
  if (maxLag <= minLag) return { periodFrames: null, confidence: 0, tempoModel: 'constant' };

  // Histogram of inter-onset frame intervals within the valid beat period range.
  const hist = new Float32Array(maxLag + 1);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const idx = onsets[j] - onsets[i];
      if (idx >= minLag && idx <= maxLag) {
        const w = 1 - 0.5 * ((j - i) / Math.max(1, n - 1)); // nearby pairs weigh more
        hist[idx] += w;
      }
    }
  }

  // The adjacent-beat interval has the most pairs. Longer multiples remain
  // alternatives, but must not outvote the directly observed pulse.
  let bestLag = -1;
  let bestScore = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0;
    for (let offset = -2; offset <= 2; offset++) {
      const index = lag + offset;
      if (index >= minLag && index <= maxLag) s += hist[index];
    }
    if (s > bestScore) {
      bestScore = s;
      bestLag = lag;
    }
  }
  if (bestLag <= 0 || bestScore <= 0) {
    return { periodFrames: null, confidence: 0, tempoModel: 'constant' };
  }

  // Consistency: fraction of onset pairs whose interval is a multiple of
  // bestLag within tolerance — used for tempoModel and confidence.
  const adjacentIntervals = onsets.slice(1).map((frame, index) => frame - onsets[index]);
  const adjacentMatches = adjacentIntervals.filter(interval => (
    Math.abs(interval - bestLag) <= Math.max(2, bestLag * 0.12)
  ));
  const refinedPeriod = adjacentMatches.length > 0
    ? adjacentMatches.reduce((sum, interval) => sum + interval, 0) / adjacentMatches.length
    : bestLag;
  const tol = Math.max(1, Math.round(refinedPeriod * 0.08));
  let matching = 0;
  let total = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const interval = onsets[j] - onsets[i];
      if (interval < refinedPeriod) continue;
      const k = Math.round(interval / refinedPeriod);
      if (k < 1 || k > 60) continue; // cap: only plausible beat counts
      if (Math.abs(interval - k * refinedPeriod) <= tol * k * 0.5 + tol * 0.5) matching++;
      total++;
    }
  }
  const consistency = total > 0 ? matching / total : 0;
  const directPairStrength = adjacentMatches.length / Math.max(1, adjacentIntervals.length);
  const peakStrength = clamp(directPairStrength, 0, 1);
  const confidence = clamp(0.3 * peakStrength + 0.7 * consistency, 0, 1);
  const tempoModel: TempoModel = consistency >= 0.6 ? 'constant' : 'variable';
  return { periodFrames: refinedPeriod, confidence, tempoModel };
}

function toAlternatives(primaryBpm: number, minBpm: number, maxBpm: number, confidence: number): BpmAlternative[] {
  const primary: BpmAlternative = { bpm: primaryBpm, likelihood: clamp(confidence, 0, 1), relation: 'primary' };
  const alts: BpmAlternative[] = [primary];

  const half = primaryBpm / 2;
  const dbl = primaryBpm * 2;
  const isHalf = Math.abs(primaryBpm - half) < 1e-9;
  const isDouble = Math.abs(primaryBpm - dbl) < 1e-9;

  if (!isHalf && half >= minBpm && half <= maxBpm) {
    alts.push({ bpm: half, likelihood: clamp(confidence * 0.35, 0, 1), relation: 'half' });
  }
  if (!isDouble && dbl >= minBpm && dbl <= maxBpm) {
    alts.push({ bpm: dbl, likelihood: clamp(confidence * 0.35, 0, 1), relation: 'double' });
  }
  return alts;
}

/** Octave-resolve a BPM into [minBpm, maxBpm] by doubling/halving. */
function resolveOctave(bpm: number, minBpm: number, maxBpm: number): number {
  while (bpm < minBpm) bpm *= 2;
  while (bpm > maxBpm) bpm /= 2;
  return bpm;
}

/**
 * Detect tempo in a mono Float32 PCM buffer. Pure and synchronous.
 *
 * Returns `BpmDetectRejection` on silence / non-musical input.
 */
export function detectBpm(samples: Float32Array, params: BpmDetectorParams): BpmDetection {
  const { sampleRate, minBpm = 40, maxBpm = 220 } = params;

  if (!ArrayBuffer.isView(samples) || sampleRate < 1000 || minBpm <= 0 || maxBpm <= minBpm) {
    return BpmDetectRejection;
  }

  // Silence / non-signal gate: reject if global RMS is below a floor.
  let sumSq = 0;
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    sumSq += s * s;
  }
  const rms = Math.sqrt(sumSq / Math.max(1, samples.length));
  if (rms < 0.005) {
    return BpmDetectRejection;
  }

  const env = buildEnvelope(samples, sampleRate);
  let envelopeMinimum = Number.POSITIVE_INFINITY;
  let envelopeMaximum = 0;
  for (let index = 0; index < env.length; index++) {
    envelopeMinimum = Math.min(envelopeMinimum, env[index]);
    envelopeMaximum = Math.max(envelopeMaximum, env[index]);
  }
  if (envelopeMaximum - envelopeMinimum < 0.1) return BpmDetectRejection;
  const onset = onsetStrengths(env);
  const binMs = 5; // from buildEnvelope
  const minSeparationFrames = Math.max(
    2,
    Math.round((60_000 / maxBpm / binMs) * 0.3),
  );
  const onsets = pickOnsets(onset, minSeparationFrames);

  if (onsets.length < 6) {
    return BpmDetectRejection;
  }
  const { periodFrames, confidence, tempoModel } = correlateTempo(onsets, minBpm, maxBpm);
  if (periodFrames === null || confidence < 0.15) {
    return BpmDetectRejection;
  }

  const periodMs = periodFrames * binMs;
  const rawBpm = 60000 / periodMs;
  const octaveBpm = resolveOctave(rawBpm, minBpm, maxBpm);

  const band: ConfidenceBand = confidence >= 0.75 ? 'high' : confidence >= 0.45 ? 'medium' : 'low';

  const detectedBpm = Math.round(octaveBpm * 100) / 100;
  const alternatives = toAlternatives(detectedBpm, minBpm, maxBpm, confidence);

  // Anchor: first onset after a small warm-up (~300 ms) so the anchor is a
  // real beat, not a transient at file start. Fall back to first onset.
  const warmupFrames = Math.round(300 / binMs);
  let anchorIdx = onsets.find((f) => f >= warmupFrames);
  if (anchorIdx === undefined) anchorIdx = onsets[0];
  const suggestedAnchorMs = anchorIdx * binMs;

  return {
    found: true,
    detectedBpm,
    confidence: Math.round(clamp(confidence, 0, 1) * 1000) / 1000,
    confidenceBand: band,
    tempoModel,
    bpmAlternatives: alternatives,
    suggestedAnchorMs,
    analyzerId: DETECTOR_ID,
    analyzerVersion: DETECTOR_VERSION,
  };
}
