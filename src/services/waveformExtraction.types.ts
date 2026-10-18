export type WaveformResolution = 'basic' | 'detailed';

export interface ExtractedWaveform {
  peaks: number[];
  duration: number;
}

export interface WaveformExtractionRequest {
  audioUri: string;
  resolution: WaveformResolution;
}
