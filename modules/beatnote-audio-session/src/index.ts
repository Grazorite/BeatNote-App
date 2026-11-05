import { requireNativeModule, type EventSubscription } from 'expo-modules-core';

interface OutputRouteUnavailableEvent {
  reason: 'oldDeviceUnavailable';
}

interface BeatNoteAudioSessionNativeModule {
  setRemoteSeekSeconds(seconds: number): Promise<void>;
  addListener(
    eventName: 'onOutputRouteUnavailable',
    listener: (event: OutputRouteUnavailableEvent) => void,
  ): EventSubscription;
}

export default requireNativeModule<BeatNoteAudioSessionNativeModule>('BeatNoteAudioSession');
