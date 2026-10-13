import { useState, useEffect, useCallback, useRef } from 'react';
import { useAudioPlayer, AudioSource, setAudioModeAsync } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { useStudioStore } from './useStudioStore';
import { LOOP_BOUNDARY_TOLERANCE_MS, decideLoopWrap, markerLoopRangeAtTime } from '../utils/loopRange';

interface ErrorState {
  visible: boolean;
  title: string;
  message: string;
}

// Constants for audio playback behavior
const END_OF_TRACK_TOLERANCE_MS = 100;
const PLAYBACK_UPDATE_INTERVAL_MS = 50;

/**
 * Custom audio player hook that handles:
 * - Audio file loading and playback control
 * - End-of-track detection with automatic pause
 * - Restart from beginning when playing from end position
 * - Consistent behavior across single and stems view modes
 * - Waveform scrubbing with play state preservation
 */
export const useCustomAudioPlayer = () => {
  const [audioSource, setAudioSource] = useState<AudioSource | null>(null);
  const [audioFilename, setAudioFilename] = useState<string | null>(null);
  const [wasPlayingBeforeScrub, setWasPlayingBeforeScrub] = useState(false);
  const [error, setError] = useState<ErrorState>({ visible: false, title: '', message: '' });
  const previousSampleRef = useRef<number | null>(null);
  const loopDecisionSuspendedRef = useRef(false);
  const loopSeekInFlightRef = useRef(false);
  const failedLoopRangeKeyRef = useRef<string | null>(null);
  const player = useAudioPlayer(audioSource);
  const { isPlaying, layers, activeLayerId, setIsPlaying, addMarker, removeMarker, setSongLoaded, setSongDuration, setCurrentTime, resetLoopForNewAudio } = useStudioStore();

  const showError = useCallback((title: string, message: string) => {
    setError(prev => prev.visible ? prev : { visible: true, title, message });
  }, []);

  const hideError = useCallback(() => {
    setError(prev => prev.visible ? { visible: false, title: '', message: '' } : prev);
  }, []);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    }).catch((audioModeError: unknown) => {
      console.error('Audio mode configuration error:', audioModeError);
      showError('Audio Setup Error', 'BeatNote could not configure audio playback. Please restart the app and try again.');
    });
  }, [showError]);

  const loadSong = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'audio/mpeg',
          'audio/mp4',
          'audio/wav',
          'audio/x-wav',
          'audio/aac',
          'audio/ogg',
          'audio/flac',
          'audio/x-m4a'
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });
      
      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        
        // Additional validation for audio file types
        const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'];
        const hasValidExtension = audioExtensions.some(ext => 
          file.name.toLowerCase().endsWith(ext)
        );
        
        if (!hasValidExtension) {
          showError(
            'Invalid File Type',
            `"${file.name}" is not a supported audio file.\n\nSupported formats: MP3, WAV, M4A, AAC, OGG, FLAC`
          );
          throw new Error(`Invalid file type: ${file.name}. Only audio files are allowed.`);
        }
        
        try {
          resetLoopForNewAudio();
          setAudioSource({ uri: file.uri });
          setAudioFilename(file.name);
          setSongLoaded(true);
          Alert.alert('Success', `Audio file "${file.name}" loaded successfully!`);
        } catch (audioError) {
          console.error('Audio loading error:', audioError);
          Alert.alert('Error', 'Failed to load audio file. Please try a different format.');
          throw audioError;
        }
      }
    } catch (error) {
      // Only catch DocumentPicker errors, not validation errors
      if (error instanceof Error && error.message.includes('Invalid file type')) {
        throw error; // Re-throw validation errors
      }
      console.error('File picker error:', error);
      Alert.alert('Error', 'Failed to open file picker');
    }
  };

  const loadProjectAudio = useCallback((uri: string, filename: string) => {
    if (!uri) {
      showError('Audio Unavailable', 'This project does not contain a saved audio file reference.');
      return;
    }
    setAudioSource({ uri });
    setAudioFilename(filename);
    setSongLoaded(true);
  }, [setSongLoaded, showError]);

  const togglePlayback = useCallback(async () => {
    if (!player) return;
    
    try {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        const { currentTime, songDuration, setViewportStartTime } = useStudioStore.getState();
        
        // If at end of track, restart from beginning
        if (currentTime >= songDuration - END_OF_TRACK_TOLERANCE_MS) {
          setCurrentTime(0);
          setViewportStartTime(0); // Reset viewport for both single and stems modes
          player.seekTo(0);
          previousSampleRef.current = 0;
          failedLoopRangeKeyRef.current = null;
        } else {
          player.seekTo(currentTime / 1000); // Convert to seconds
          previousSampleRef.current = currentTime;
        }
        player.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
      Alert.alert('Playback Error', 'Failed to control audio playback');
    }
  }, [player, isPlaying, setIsPlaying, setCurrentTime]);

  const seekToPosition = useCallback(async (position: number) => {
    if (!player) return;

    loopDecisionSuspendedRef.current = true;
    try {
      const { songDuration } = useStudioStore.getState();
      // Clamp position to valid range
      const clampedPosition = Math.max(0, Math.min(position, songDuration));
      const wasPlaying = isPlaying;
      
      // Always update the store time first
      setCurrentTime(clampedPosition);
      
      // Seek the audio player
      await player.seekTo(clampedPosition / 1000); // Convert to seconds
      previousSampleRef.current = clampedPosition;
      failedLoopRangeKeyRef.current = null;
      
      // Continue playing if it was playing before
      if (wasPlaying) {
        await player.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Seek error:', error);
      Alert.alert('Seek Error', 'Failed to seek to position');
      const reportedPosition = (player.currentTime ?? 0) * 1000;
      previousSampleRef.current = reportedPosition;
      setCurrentTime(reportedPosition);
    } finally {
      loopDecisionSuspendedRef.current = false;
    }
  }, [player, isPlaying, setIsPlaying, setCurrentTime]);

  const startWaveformScrub = async () => {
    loopDecisionSuspendedRef.current = true;
    if (player && isPlaying) {
      setWasPlayingBeforeScrub(true);
      player.pause();
      setIsPlaying(false);
    } else {
      setWasPlayingBeforeScrub(false);
    }
  };

  const endWaveformScrub = async () => {
    if (player) {
      const { currentTime } = useStudioStore.getState();
      try {
        await player.seekTo(currentTime / 1000); // Convert to seconds
        previousSampleRef.current = currentTime;
        failedLoopRangeKeyRef.current = null;
        if (wasPlayingBeforeScrub) {
          player.play();
          setIsPlaying(true);
        }
      } catch (scrubError) {
        console.error('Scrub seek error:', scrubError);
        const reportedPosition = (player.currentTime ?? 0) * 1000;
        previousSampleRef.current = reportedPosition;
        setCurrentTime(reportedPosition);
      }
    }
    setWasPlayingBeforeScrub(false);
    loopDecisionSuspendedRef.current = false;
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

  // Update song duration when audio loads
  useEffect(() => {
    if (player?.duration) {
      setSongDuration(player.duration * 1000); // Convert to milliseconds
    }
  }, [player?.duration, setSongDuration]);

  // Handle playback position updates and end-of-track detection
  useEffect(() => {
    if (!player || !isPlaying) return;

    const interval = setInterval(() => {
      if (player.currentTime !== undefined) {
        const currentTimeMs = player.currentTime * 1000; // Convert to milliseconds
        const {
          isLoopRangeEnabled,
          isLoopMarkerActive,
          loopStartMs,
          loopEndMs,
          songDuration,
          isRepeatActive,
          layerSpecificNavigation,
          activeLayerId,
          allLayersData,
        } = useStudioStore.getState();

        if (loopDecisionSuspendedRef.current || loopSeekInFlightRef.current) {
          previousSampleRef.current = currentTimeMs;
          setCurrentTime(currentTimeMs);
          return;
        }

        const previousSampleMs = previousSampleRef.current ?? currentTimeMs;
        const markerTimes = layerSpecificNavigation
          ? allLayersData.find(layer => layer.id === activeLayerId)?.markers ?? []
          : allLayersData.flatMap(layer => layer.markers);
        const markerRange = isLoopMarkerActive
          ? markerLoopRangeAtTime(markerTimes, previousSampleMs, songDuration)
          : { loopStartMs: null, loopEndMs: null };
        const effectiveLoopStartMs = isLoopRangeEnabled ? loopStartMs : markerRange.loopStartMs;
        const effectiveLoopEndMs = isLoopRangeEnabled ? loopEndMs : markerRange.loopEndMs;
        const loopIsEnabled = isLoopRangeEnabled || isLoopMarkerActive;
        const loopRangeKey = `${isLoopRangeEnabled ? 'range' : 'marker'}:${effectiveLoopStartMs}:${effectiveLoopEndMs}`;
        if (failedLoopRangeKeyRef.current !== null && failedLoopRangeKeyRef.current !== loopRangeKey) {
          failedLoopRangeKeyRef.current = null;
        }
        if (failedLoopRangeKeyRef.current === loopRangeKey
          && (!loopIsEnabled
            || effectiveLoopStartMs === null
            || effectiveLoopEndMs === null
            || currentTimeMs < effectiveLoopStartMs
            || currentTimeMs < effectiveLoopEndMs - LOOP_BOUNDARY_TOLERANCE_MS)) {
          failedLoopRangeKeyRef.current = null;
        }
        const decision = failedLoopRangeKeyRef.current === loopRangeKey
          ? { kind: 'noWrap' as const }
          : decideLoopWrap({
              isEnabled: loopIsEnabled,
              isPlaying,
              loopStartMs: effectiveLoopStartMs,
              loopEndMs: effectiveLoopEndMs,
              previousSampleMs,
              currentSampleMs: currentTimeMs,
              toleranceMs: LOOP_BOUNDARY_TOLERANCE_MS,
            });

        if (decision.kind === 'wrap') {
          loopSeekInFlightRef.current = true;
          void Promise.resolve(player.seekTo(decision.targetMs / 1000))
            .then(() => {
              player.play();
              setCurrentTime(decision.targetMs);
              previousSampleRef.current = decision.targetMs;
              failedLoopRangeKeyRef.current = null;
            })
            .catch((seekError: unknown) => {
              console.error('Bounded loop seek failed', {
                error: seekError,
                targetMs: decision.targetMs,
              });
              const reportedPosition = (player.currentTime ?? 0) * 1000;
              setCurrentTime(reportedPosition);
              previousSampleRef.current = reportedPosition;
              failedLoopRangeKeyRef.current = loopRangeKey;
            })
            .finally(() => {
              loopSeekInFlightRef.current = false;
            });
          return;
        }

        previousSampleRef.current = currentTimeMs;

        // Check if reached end of track
        if (currentTimeMs >= songDuration - END_OF_TRACK_TOLERANCE_MS) {
          if (isRepeatActive) {
            // Restart from beginning when repeat is active
            setCurrentTime(0);
            player.seekTo(0);
            player.play(); // Continue playing
            previousSampleRef.current = 0;
            failedLoopRangeKeyRef.current = null;
          } else {
            player.pause();
            setIsPlaying(false);
            setCurrentTime(songDuration); // Set to exact end for consistent UI
          }
        } else {
          setCurrentTime(currentTimeMs);
        }
      }
    }, PLAYBACK_UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [player, isPlaying, setCurrentTime, setIsPlaying]);

  return {
    sound: player,
    audioUri: typeof audioSource === 'object' && audioSource?.uri ? audioSource.uri : null,
    audioFilename,
    loadProjectAudio,
    loadSong,
    togglePlayback,
    tapToBeat,
    seekToPosition,
    startWaveformScrub,
    endWaveformScrub,
    error,
    hideError,
  };
};
