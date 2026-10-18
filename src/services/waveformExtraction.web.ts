import {
  ExtractedWaveform,
  WaveformExtractionRequest,
} from './waveformExtraction.types';

export type { WaveformResolution } from './waveformExtraction.types';

export async function extractWaveform({
  audioUri,
  resolution,
}: WaveformExtractionRequest): Promise<ExtractedWaveform> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  try {
    const response = await fetch(audioUri);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const duration = audioBuffer.duration;
    const targetSamplesPerSecond = resolution === 'detailed'
      ? Math.min(200, Math.max(50, duration > 60 ? 100 : 150))
      : 25;
    const sampleCount = Math.max(1, Math.floor(duration * targetSamplesPerSecond));
    const samplesPerBlock = Math.max(1, Math.floor(audioBuffer.length / sampleCount));
    const peaks: number[] = [];

    for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex++) {
      const startSample = sampleIndex * samplesPerBlock;
      const endSample = Math.min(startSample + samplesPerBlock, audioBuffer.length);
      let maximum = 0;
      let squaredTotal = 0;
      let valueCount = 0;

      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        for (let frame = startSample; frame < endSample; frame++) {
          const value = channelData[frame] || 0;
          maximum = Math.max(maximum, Math.abs(value));
          squaredTotal += value * value;
          valueCount++;
        }
      }

      const rms = valueCount > 0 ? Math.sqrt(squaredTotal / valueCount) : 0;
      peaks.push(Math.min(maximum * 0.7 + rms * 0.3, 1));
    }

    const maximum = Math.max(...peaks);
    if (maximum > 0) {
      const normalizer = 0.95 / maximum;
      for (let index = 0; index < peaks.length; index++) {
        peaks[index] = Math.min(peaks[index] * normalizer, 1);
      }
    }

    return { peaks, duration: duration * 1_000 };
  } finally {
    await audioContext.close();
  }
}
