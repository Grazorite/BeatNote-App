import type { ExtractedWaveform, WaveformResolution } from './waveformExtraction.types';

const ANALYSIS_SAMPLE_RATE = 11_025;
const MAX_CACHED_DECODES = 2;

export interface WebAnalysisSamples {
  analysisSampleRate: number;
  analysisSamples: Float32Array;
  durationMs: number;
}

export interface WebAudioProducts {
  analysis: Promise<WebAnalysisSamples>;
  durationMs: number;
  waveforms: Record<WaveformResolution, ExtractedWaveform>;
}

const decodeCache = new Map<string, Promise<WebAudioProducts>>();

const normalizedPeaks = (
  maxima: Float32Array,
  squaredTotals: Float64Array,
  counts: Uint32Array,
): number[] => {
  let maximum = 0;
  const peaks = Array.from(maxima, (peakMaximum, index) => {
    const rms = counts[index] > 0 ? Math.sqrt(squaredTotals[index] / counts[index]) : 0;
    const value = Math.min(peakMaximum * 0.7 + rms * 0.3, 1);
    maximum = Math.max(maximum, value);
    return value;
  });
  if (maximum <= 0) return peaks;
  const normalizer = 0.95 / maximum;
  return peaks.map(value => Math.min(value * normalizer, 1));
};

const createWaveforms = (
  audioBuffer: AudioBuffer,
): Record<WaveformResolution, ExtractedWaveform> => {
  const durationSeconds = audioBuffer.duration;
  const detailedSamplesPerSecond = Math.min(
    200,
    Math.max(50, durationSeconds > 60 ? 100 : 150),
  );
  const basicCount = Math.max(1, Math.floor(durationSeconds * 25));
  const detailedCount = Math.max(1, Math.floor(durationSeconds * detailedSamplesPerSecond));
  const basicMaxima = new Float32Array(basicCount);
  const basicSquares = new Float64Array(basicCount);
  const basicValueCounts = new Uint32Array(basicCount);
  const detailedMaxima = new Float32Array(detailedCount);
  const detailedSquares = new Float64Array(detailedCount);
  const detailedValueCounts = new Uint32Array(detailedCount);
  const channelData = Array.from(
    { length: audioBuffer.numberOfChannels },
    (_, channel) => audioBuffer.getChannelData(channel),
  );

  for (let frame = 0; frame < audioBuffer.length; frame++) {
    const basicIndex = Math.min(Math.floor(frame * basicCount / audioBuffer.length), basicCount - 1);
    const detailedIndex = Math.min(
      Math.floor(frame * detailedCount / audioBuffer.length),
      detailedCount - 1,
    );
    for (const channel of channelData) {
      const value = channel[frame] || 0;
      const magnitude = Math.abs(value);
      basicMaxima[basicIndex] = Math.max(basicMaxima[basicIndex], magnitude);
      detailedMaxima[detailedIndex] = Math.max(detailedMaxima[detailedIndex], magnitude);
      basicSquares[basicIndex] += value * value;
      detailedSquares[detailedIndex] += value * value;
      basicValueCounts[basicIndex]++;
      detailedValueCounts[detailedIndex]++;
    }
  }

  const duration = durationSeconds * 1_000;
  return {
    basic: {
      peaks: normalizedPeaks(basicMaxima, basicSquares, basicValueCounts),
      duration,
    },
    detailed: {
      peaks: normalizedPeaks(detailedMaxima, detailedSquares, detailedValueCounts),
      duration,
    },
  };
};

const yieldToBrowser = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 0));

const createAnalysisSamples = async (audioBuffer: AudioBuffer): Promise<WebAnalysisSamples> => {
  const analysisCount = Math.max(
    1,
    Math.floor(audioBuffer.length * ANALYSIS_SAMPLE_RATE / audioBuffer.sampleRate),
  );
  const totals = new Float64Array(analysisCount);
  const counts = new Uint32Array(analysisCount);
  const channelData = Array.from(
    { length: audioBuffer.numberOfChannels },
    (_, channel) => audioBuffer.getChannelData(channel),
  );

  const framesPerTask = 32_768;
  for (let chunkStart = 0; chunkStart < audioBuffer.length; chunkStart += framesPerTask) {
    const chunkEnd = Math.min(audioBuffer.length, chunkStart + framesPerTask);
    for (let frame = chunkStart; frame < chunkEnd; frame++) {
      const analysisIndex = Math.min(
        Math.floor(frame * analysisCount / audioBuffer.length),
        analysisCount - 1,
      );
      let mono = 0;
      for (const channel of channelData) mono += channel[frame] || 0;
      totals[analysisIndex] += mono / Math.max(1, channelData.length);
      counts[analysisIndex]++;
    }
    if (chunkEnd < audioBuffer.length) await yieldToBrowser();
  }

  const analysisSamples = new Float32Array(analysisCount);
  for (let index = 0; index < analysisCount; index++) {
    analysisSamples[index] = counts[index] > 0 ? totals[index] / counts[index] : 0;
  }
  return {
    analysisSampleRate: ANALYSIS_SAMPLE_RATE,
    analysisSamples,
    durationMs: audioBuffer.duration * 1_000,
  };
};

const afterWaveformPaint = (): Promise<void> => new Promise(resolve => {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => setTimeout(resolve, 0));
  } else {
    setTimeout(resolve, 0);
  }
});

const decode = async (audioUri: string): Promise<WebAudioProducts> => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  try {
    const response = await fetch(audioUri);
    if (!response.ok && response.status !== 0) {
      throw new Error(`Unable to load audio for decoding (${response.status})`);
    }
    const audioBuffer = await audioContext.decodeAudioData(await response.arrayBuffer());
    const waveforms = createWaveforms(audioBuffer);
    const analysis = afterWaveformPaint()
      .then(() => createAnalysisSamples(audioBuffer))
      .finally(() => audioContext.close());
    return { analysis, durationMs: audioBuffer.duration * 1_000, waveforms };
  } catch (error) {
    await audioContext.close();
    throw error;
  }
};

/** Decode one web source once, resolving waveform products before deferred analysis mixdown. */
export function getWebAudioProducts(audioUri: string): Promise<WebAudioProducts> {
  const cached = decodeCache.get(audioUri);
  if (cached) return cached;

  const request = decode(audioUri).catch(error => {
    decodeCache.delete(audioUri);
    throw error;
  });
  decodeCache.set(audioUri, request);
  while (decodeCache.size > MAX_CACHED_DECODES) {
    const oldestKey = decodeCache.keys().next().value as string | undefined;
    if (oldestKey === undefined || oldestKey === audioUri) break;
    decodeCache.delete(oldestKey);
  }
  return request;
}

/** Consume and evict the shared mono signal once an analysis worker is ready to own its buffer. */
export async function takeWebAnalysisSamples(audioUri: string): Promise<WebAnalysisSamples> {
  const request = getWebAudioProducts(audioUri);
  try {
    return await (await request).analysis;
  } finally {
    if (decodeCache.get(audioUri) === request) decodeCache.delete(audioUri);
  }
}
