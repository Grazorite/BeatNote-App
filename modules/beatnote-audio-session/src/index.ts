import { requireNativeModule, type EventSubscription } from 'expo-modules-core';

interface OutputRouteUnavailableEvent {
  reason: 'oldDeviceUnavailable';
}

interface BeatNoteAudioSessionNativeModule {
  configureRemoteButtons(mode: 'seek' | 'tracks' | 'off', seconds: number, previous: boolean, next: boolean): Promise<void>;
  addListener(eventName: 'onRemoteTrack', listener: (event: { direction: 'previous' | 'next' }) => void): EventSubscription;
  addListener(
    eventName: 'onOutputRouteUnavailable',
    listener: (event: OutputRouteUnavailableEvent) => void,
  ): EventSubscription;
}

export default requireNativeModule<BeatNoteAudioSessionNativeModule>('BeatNoteAudioSession');
