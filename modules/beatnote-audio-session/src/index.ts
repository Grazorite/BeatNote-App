import { requireNativeModule, type EventSubscription } from 'expo-modules-core';

interface OutputRouteUnavailableEvent {
  reason: 'oldDeviceUnavailable';
}

interface BeatNoteAudioSessionNativeModule {
  addListener(
    eventName: 'onOutputRouteUnavailable',
    listener: (event: OutputRouteUnavailableEvent) => void,
  ): EventSubscription;
}

export default requireNativeModule<BeatNoteAudioSessionNativeModule>('BeatNoteAudioSession');
