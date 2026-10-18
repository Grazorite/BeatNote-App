import BeatNoteWaveform from '../../modules/beatnote-waveform/src';
import {
  ExtractedWaveform,
  WaveformExtractionRequest,
} from './waveformExtraction.types';

export type { WaveformResolution } from './waveformExtraction.types';

export async function extractWaveform({
  audioUri,
  resolution,
}: WaveformExtractionRequest): Promise<ExtractedWaveform> {
  const targetSamplesPerSecond = resolution === 'detailed' ? 100 : 25;
  const result = await BeatNoteWaveform.extractPeaksAsync(audioUri, targetSamplesPerSecond);
  return {
    peaks: result.peaks,
    duration: result.durationMs,
  };
}
