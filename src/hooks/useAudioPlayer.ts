import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { useStudioStore } from './useStudioStore';

export const useAudioPlayer = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const { isPlaying, markers, setIsPlaying, addMarker, removeMarker, setSongLoaded } = useStudioStore();

  const loadSong = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets[0]) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: result.assets[0].uri },
          { shouldPlay: false }
        );
        setSound(newSound);
        setSongLoaded(true);
        Alert.alert('Success', 'Song loaded successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load song');
    }
  };

  const togglePlayback = async () => {
    if (!sound) return;
    
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const tapToBeat = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        const currentTime = status.positionMillis || 0;
        const existingMarker = markers.find(marker => Math.abs(marker - currentTime) <= 100);
        
        if (existingMarker !== undefined) {
          removeMarker(existingMarker);
        } else {
          addMarker(currentTime);
        }
      }
    }
  };

  useEffect(() => {
    return sound ? () => {
      sound.unloadAsync();
      setSongLoaded(false);
    } : undefined;
  }, [sound]);

  return {
    sound,
    loadSong,
    togglePlayback,
    tapToBeat,
  };
};