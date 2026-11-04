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
  signal,
}: WaveformExtractionRequest): Promise<ExtractedWaveform> {
  const targetSamplesPerSecond = resolution === 'detailed' ? 100 : 25;
  BeatNoteWaveform.enableSignposts?.(perfMarksEnabled);
  if (signal?.aborted) throw new Error('Waveform request cancelled');
  const requestId = signal ? BeatNoteWaveform.beginRequest() : null;
  const cancel = () => {
    if (requestId !== null) BeatNoteWaveform.cancelRequest(requestId);
  };
  signal?.addEventListener('abort', cancel);
  try {
    const result = await BeatNoteWaveform.extractPeaksAsync(audioUri, targetSamplesPerSecond, requestId);
    return { peaks: result.peaks, duration: result.durationMs };
  } finally {
    signal?.removeEventListener('abort', cancel);
  }
}
