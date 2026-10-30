import BeatNoteWaveform from '../../modules/beatnote-waveform/src';
import { perfMarksEnabled } from '../utils/perfMarks';
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
  BeatNoteWaveform.enableSignposts?.(perfMarksEnabled);
  const result = await BeatNoteWaveform.extractPeaksAsync(audioUri, targetSamplesPerSecond);
  return {
    peaks: result.peaks,
    duration: result.durationMs,
  };
}
