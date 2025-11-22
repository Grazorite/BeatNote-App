import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { useStudioStore } from './useStudioStore';

export const useAudioPlayer = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const { isPlaying, layers, activeLayerId, setIsPlaying, addMarker, removeMarker, setSongLoaded, setSongDuration, setCurrentTime } = useStudioStore();

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
        
        // Get actual song duration - wait for it to be ready
        const checkDuration = async () => {
          let attempts = 0;
          const maxAttempts = 10;
          
          while (attempts < maxAttempts) {
            const status = await newSound.getStatusAsync();
            if (status.isLoaded && status.durationMillis) {
              setSongDuration(status.durationMillis);
              break;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
        };
        
        checkDuration();
        
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
      const { currentTime } = useStudioStore.getState();
      await sound.setPositionAsync(currentTime);
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const tapToBeat = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        // Always use current playhead position (orange line)
        const { currentTime } = useStudioStore.getState();
        const markerTime = currentTime;
          
        const activeLayer = layers.find(layer => layer.id === activeLayerId);
        const existingMarker = activeLayer?.markers.find(marker => Math.abs(marker - markerTime) <= 100);
        
        if (existingMarker !== undefined) {
          removeMarker(existingMarker);
        } else {
          addMarker(markerTime);
        }
      }
    }
  };

  // Update current time during playback using expo-av's built-in callback
  useEffect(() => {
    if (sound) {
      const setupStatusCallback = async () => {
        await sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.positionMillis !== undefined) {
            setCurrentTime(status.positionMillis);
          }
        });
      };
      setupStatusCallback();
    }
    
    return () => {
      if (sound) {
        sound.setOnPlaybackStatusUpdate(null);
      }
    };
  }, [sound, setCurrentTime]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.setOnPlaybackStatusUpdate(null);
        sound.unloadAsync();
        setSongLoaded(false);
      }
    };
  }, [sound, setSongLoaded]);

  return {
    sound,
    loadSong,
    togglePlayback,
    tapToBeat,
  };
};