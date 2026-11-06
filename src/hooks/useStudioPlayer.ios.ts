import { createAudioPlayer, type AudioSource } from 'expo-audio';
import { useReleasingSharedObject } from 'expo-modules-core';

// Use Expo's player ownership lifecycle with one additional dependency so recovery can dispose
// a failed AVPlayer and create a new one for the same file.
export const useStudioPlayer = (source: AudioSource, generation: number) =>
  useReleasingSharedObject(() => createAudioPlayer(source), [source, generation]);
