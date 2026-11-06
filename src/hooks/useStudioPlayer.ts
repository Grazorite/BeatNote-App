import { useAudioPlayer, type AudioSource } from 'expo-audio';

export const useStudioPlayer = (source: AudioSource, _generation: number) => useAudioPlayer(source);
