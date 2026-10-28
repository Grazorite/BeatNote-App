import {
  ExtractedWaveform,
  WaveformExtractionRequest,
} from './waveformExtraction.types';
import { getWebAudioProducts } from './webAudioDecode';

export type { WaveformResolution } from './waveformExtraction.types';

export async function extractWaveform({
  audioUri,
  resolution,
}: WaveformExtractionRequest): Promise<ExtractedWaveform> {
  const products = await getWebAudioProducts(audioUri);
  return products.waveforms[resolution];
}
