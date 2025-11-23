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
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets[0]) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: result.assets[0].uri },
          { 
            shouldPlay: false, 
            progressUpdateIntervalMillis: 50,
            isLooping: false,
            volume: 1.0,
            rate: 1.0,
            shouldCorrectPitch: true
          }
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

  const seekToPosition = async (position: number) => {
    if (sound && isPlaying) {
      try {
        await sound.setPositionAsync(position, { toleranceMillisBefore: 0, toleranceMillisAfter: 0 });
      } catch (error) {
        // Ignore seek errors to prevent interruption
      }
    }
  };

  const startWaveformScrub = async () => {
    if (sound && isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const endWaveformScrub = async () => {
    if (sound) {
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
        const { currentTime } = useStudioStore.getState();
        
        // Only sync audio position when paused to avoid interruption
        if (!isPlaying) {
          await sound.setPositionAsync(currentTime);
        }
        
        const activeLayer = layers.find(layer => layer.id === activeLayerId);
        const existingMarker = activeLayer?.markers.find(marker => Math.abs(marker - currentTime) <= 100);
        
        if (existingMarker !== undefined) {
          removeMarker(existingMarker);
        } else {
          addMarker(currentTime);
        }
      }
    }
  };

  // Update current time during playback using expo-av's built-in callback
  useEffect(() => {
    if (sound) {
      const setupStatusCallback = async () => {
        await sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.positionMillis !== undefined && isPlaying) {
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
  }, [sound, setCurrentTime, isPlaying]);

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
    seekToPosition,
    startWaveformScrub,
    endWaveformScrub,
  };
};