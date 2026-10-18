import {
  ExtractedWaveform,
  WaveformExtractionRequest,
} from './waveformExtraction.types';

export type { WaveformResolution } from './waveformExtraction.types';

/**
 * Platform waveform provider boundary. Unsupported native platforms keep the
 * useful timing-bar fallback until they supply a real decoder.
 *
 * `resolution` is intentionally explicit so a future capability service can
 * select basic versus detailed extraction without coupling purchase state to
 * the waveform components or native decoder.
 */
export async function extractWaveform(
  _request: WaveformExtractionRequest,
): Promise<ExtractedWaveform | null> {
  return null;
}
