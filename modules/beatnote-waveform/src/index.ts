import { requireNativeModule } from 'expo-modules-core';

export interface NativeWaveformResult {
  peaks: number[];
  durationMs: number;
}

interface BeatNoteWaveformNativeModule {
  enableSignposts?(enabled: boolean): void;
  beginRequest(): string;
  cancelRequest(id: string): void;
  extractPeaksAsync(audioUri: string, targetSamplesPerSecond: number, requestId: string | null): Promise<NativeWaveformResult>;
}

export default requireNativeModule<BeatNoteWaveformNativeModule>('BeatNoteWaveform');
