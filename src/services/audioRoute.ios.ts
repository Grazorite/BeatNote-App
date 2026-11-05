import BeatNoteAudioSession from '../../modules/beatnote-audio-session/src';

export const setRemoteSeekSeconds = (seconds: number) => BeatNoteAudioSession.setRemoteSeekSeconds(seconds);

/** Subscribe to iOS output-route loss such as wired or Bluetooth headphone disconnection. */
export const subscribeToOutputRouteUnavailable = (listener: () => void): (() => void) => {
  const subscription = BeatNoteAudioSession.addListener('onOutputRouteUnavailable', listener);
  return () => subscription.remove();
};
