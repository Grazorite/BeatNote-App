import { useState, useEffect } from 'react';
import { useAudioPlayer, AudioSource } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { useStudioStore } from './useStudioStore';

export const useCustomAudioPlayer = () => {
  const [audioSource, setAudioSource] = useState<AudioSource | null>(null);
  const [wasPlayingBeforeScrub, setWasPlayingBeforeScrub] = useState(false);
  const player = useAudioPlayer(audioSource);
  const { isPlaying, layers, activeLayerId, setIsPlaying, addMarker, removeMarker, setSongLoaded, setSongDuration, setCurrentTime } = useStudioStore();

  const loadSong = async () => {
    try {
      // Audio mode configuration not needed in expo-audio
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets[0]) {
        try {
          setAudioSource({ uri: result.assets[0].uri });
          setSongLoaded(true);
          Alert.alert('Success', 'Song loaded successfully!');
        } catch (audioError) {
          console.error('Audio loading error:', audioError);
          Alert.alert('Error', 'Failed to load audio file');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load song');
    }
  };

  const togglePlayback = async () => {
    if (!player) return;
    
    try {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        const { currentTime } = useStudioStore.getState();
        player.seekTo(currentTime / 1000); // Convert to seconds
        player.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const seekToPosition = async (position: number) => {
    console.log('seekToPosition called:', { position, isPlaying, hasPlayer: !!player });
    if (player) {
      try {
        const wasPlaying = isPlaying;
        console.log('Seeking to position:', position / 1000, 'wasPlaying:', wasPlaying);
        player.seekTo(position / 1000); // Convert to seconds
        if (wasPlaying) {
          console.log('Continuing playback after seek');
          player.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Seek error:', error);
      }
    }
  };

  const startWaveformScrub = async () => {
    if (player && isPlaying) {
      setWasPlayingBeforeScrub(true);
      player.pause();
      setIsPlaying(false);
    } else {
      setWasPlayingBeforeScrub(false);
    }
  };

  const endWaveformScrub = async () => {
    if (player && wasPlayingBeforeScrub) {
      const { currentTime } = useStudioStore.getState();
      player.seekTo(currentTime / 1000); // Convert to seconds
      player.play();
      setIsPlaying(true);
    }
    setWasPlayingBeforeScrub(false);
  };

  const tapToBeat = async () => {
    const { currentTime } = useStudioStore.getState();
    
    // Only sync audio position when paused to avoid interruption
    if (player && !isPlaying) {
      player.seekTo(currentTime / 1000); // Convert to seconds
    }
    
    const activeLayer = layers.find(layer => layer.id === activeLayerId);
    const existingMarker = activeLayer?.markers.find(marker => Math.abs(marker - currentTime) <= 100);
    
    if (existingMarker !== undefined) {
      removeMarker(existingMarker);
    } else {
      addMarker(currentTime);
    }
  };

  // Update duration and current time
  useEffect(() => {
    if (player) {
      if (player.duration) {
        setSongDuration(player.duration * 1000); // Convert to milliseconds
      }
    }
  }, [player, player?.duration, setSongDuration]);

  useEffect(() => {
    if (player && isPlaying) {
      const interval = setInterval(() => {
        if (player.currentTime !== undefined) {
          setCurrentTime(player.currentTime * 1000); // Convert to milliseconds
        }
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [player, isPlaying, setCurrentTime]);

  return {
    sound: player,
    audioUri: typeof audioSource === 'object' && audioSource?.uri ? audioSource.uri : null,
    loadSong,
    togglePlayback,
    tapToBeat,
    seekToPosition,
    startWaveformScrub,
    endWaveformScrub,
  };
};