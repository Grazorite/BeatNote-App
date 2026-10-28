import { EventSubscription, requireNativeModule } from 'expo-modules-core';

export interface NativeTempoResult {
  detectedBpm: number;
  confidence: number;
  confidenceBand: 'high' | 'medium' | 'low';
  tempoModel: 'constant' | 'variable';
  bpmAlternatives: Array<{
    bpm: number;
    likelihood: number;
    relation: 'primary' | 'half' | 'double' | 'other';
  }>;
  suggestedAnchorMs: number;
}

interface ProgressEvent {
  requestId: string;
  fraction: number;
}

interface BeatNoteTempoNativeModule {
  analyzeTempoAsync(
    audioUri: string,
    requestId: string,
    minBpm: number,
    maxBpm: number,
  ): Promise<NativeTempoResult>;
  cancelAnalysis(requestId: string): void;
  addListener(eventName: 'onAnalysisProgress', listener: (event: ProgressEvent) => void): EventSubscription;
}

export default requireNativeModule<BeatNoteTempoNativeModule>('BeatNoteTempo');
