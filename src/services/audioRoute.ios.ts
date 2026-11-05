import BeatNoteAudioSession from '../../modules/beatnote-audio-session/src';

export const configureRemoteButtons = (mode: 'seek' | 'tracks' | 'off', seconds: number, previous: boolean, next: boolean) =>
  BeatNoteAudioSession.configureRemoteButtons(mode, seconds, previous, next);

export const subscribeToRemoteTrack = (listener: (direction: 'previous' | 'next') => void) => {
  const subscription = BeatNoteAudioSession.addListener('onRemoteTrack', event => listener(event.direction));
  return () => subscription.remove();
};

/** Subscribe to iOS output-route loss such as wired or Bluetooth headphone disconnection. */
export const subscribeToOutputRouteUnavailable = (listener: () => void): (() => void) => {
  const subscription = BeatNoteAudioSession.addListener('onOutputRouteUnavailable', listener);
  return () => subscription.remove();
};
