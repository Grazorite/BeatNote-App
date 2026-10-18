import { requireNativeModule } from 'expo-modules-core';

export interface NativeWaveformResult {
  peaks: number[];
  durationMs: number;
}

interface BeatNoteWaveformNativeModule {
  extractPeaksAsync(audioUri: string, targetSamplesPerSecond: number): Promise<NativeWaveformResult>;
}

export default requireNativeModule<BeatNoteWaveformNativeModule>('BeatNoteWaveform');
