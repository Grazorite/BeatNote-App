import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { BeatNoteIcon } from '../../icons';
import { audioControlsStyles as styles } from '../../../styles/components/controls/audioControls';
import { isValidLoopRange } from '../../../utils/loopRange';
import { capabilitiesForLoadedItem } from '../../../features/library/sourceResolver';

interface AudioControlsProps {
  onTogglePlayback: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  isMobile?: boolean;
  compact?: boolean;
}

const AudioControls: React.FC<AudioControlsProps> = ({ 
  onTogglePlayback, 
  onSkipBack, 
  onSkipForward,
  isMobile = false,
  compact = false,
}) => {
  const {
    isPlaying,
    songLoaded,
    currentTime,
    songDuration,
    isRepeatActive,
    toggleRepeat,
    isLoopRangeEnabled,
    toggleLoopRangeEnabled,
    capabilities,
  } = useStudioStore(useShallow(state => ({
    isPlaying: state.isPlaying,
    songLoaded: state.songLoaded,
    currentTime: state.currentTime,
    songDuration: state.songDuration,
    isRepeatActive: state.isRepeatActive,
    toggleRepeat: state.toggleRepeat,
    isLoopRangeEnabled: state.isLoopRangeEnabled,
    toggleLoopRangeEnabled: state.toggleLoopRangeEnabled,
    capabilities: capabilitiesForLoadedItem(
      state.currentMusicItemId === null ? null : state.libraryItems[state.currentMusicItemId] ?? null,
      state.songLoaded && state.currentAudioUri !== null,
    ),
  })));
  const hasValidLoop = useStudioStore(state => state.songLoaded && isValidLoopRange(state, state.songDuration));
  const canToggleLoop = hasValidLoop && capabilities.exactSeeking && capabilities.waveformAccess;

  const canSkipBack = songLoaded && capabilities.exactSeeking && currentTime > 0;
  const canSkipForward = songLoaded && capabilities.exactSeeking && currentTime < songDuration;
  const canRepeat = songLoaded && capabilities.repeat;
  const currentSeconds = Math.floor(Math.max(0, currentTime) / 1000);
  const currentLabel = `Current: ${Math.floor(currentSeconds / 60)}:${String(currentSeconds % 60).padStart(2, '0')}`;

  const getPlayPauseButtonStyle = (enabled: boolean) => [
    styles.button,
    isMobile && styles.buttonMobile,
    compact && styles.buttonCompact,
    enabled ? styles.audioControlsEnabled : styles.buttonDisabled
  ];
  
  const getSkipButtonStyle = (enabled: boolean) => [
    styles.button,
    isMobile && styles.buttonMobile,
    compact && styles.buttonCompact,
    enabled ? styles.skipButtonEnabled : styles.buttonDisabled
  ];
  
  const getRepeatButtonStyle = (enabled: boolean, active: boolean) => [
    styles.button,
    isMobile && styles.buttonMobile,
    compact && styles.buttonCompact,
    enabled ? (active ? styles.repeatButtonActive : styles.repeatButtonInactive) : styles.buttonDisabled
  ];

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, isMobile && styles.containerMobile]}>
      <TouchableOpacity
        style={getSkipButtonStyle(canSkipBack)}
        onPress={canSkipBack && songLoaded ? onSkipBack : undefined}
        disabled={!songLoaded || !capabilities.exactSeeking}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
        testID="skip-back"
        accessibilityHint={!capabilities.exactSeeking ? 'Exact seeking is unavailable for this audio source' : undefined}
      >
        <BeatNoteIcon name="previous" size={compact ? 20 : isMobile ? 24 : 32} color={canSkipBack ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={getPlayPauseButtonStyle(songLoaded)}
        onPress={songLoaded ? onTogglePlayback : undefined}
        disabled={!songLoaded}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
        testID="play-pause"
        accessibilityLabel={isPlaying ? 'Pause playback' : 'Play playback'}
      >
        <BeatNoteIcon name={isPlaying ? 'pause' : 'play'} size={compact ? 20 : isMobile ? 24 : 32} color={songLoaded ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={getSkipButtonStyle(canSkipForward)}
        onPress={canSkipForward && songLoaded ? onSkipForward : undefined}
        disabled={!songLoaded}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
        testID="skip-forward"
        accessibilityHint={!capabilities.exactSeeking ? 'Exact seeking is unavailable for this audio source' : undefined}
      >
        <BeatNoteIcon name="next" size={compact ? 20 : isMobile ? 24 : 32} color={canSkipForward ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={getRepeatButtonStyle(canRepeat, isRepeatActive)}
        onPress={canRepeat ? toggleRepeat : undefined}
        disabled={!canRepeat}
        testID="repeat-toggle"
        accessibilityRole="button"
        accessibilityLabel="Repeat song"
        accessibilityState={{ checked: isRepeatActive, disabled: !canRepeat }}
        accessibilityHint={!capabilities.repeat ? 'Repeat is unavailable for this audio source' : undefined}
        aria-pressed={isRepeatActive}
        aria-disabled={!canRepeat}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
      >
        <BeatNoteIcon name="repeat" size={compact ? 20 : isMobile ? 24 : 32} color={canRepeat ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
      <TouchableOpacity
        style={getRepeatButtonStyle(canToggleLoop, isLoopRangeEnabled)}
        onPress={canToggleLoop ? toggleLoopRangeEnabled : undefined}
        disabled={!canToggleLoop}
        testID="loop-region-toggle"
        accessibilityRole="button"
        accessibilityLabel="Loop selected range"
        accessibilityState={{ checked: isLoopRangeEnabled, disabled: !canToggleLoop }}
        aria-pressed={isLoopRangeEnabled}
        aria-disabled={!canToggleLoop}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
      >
        <BeatNoteIcon name="range-loop" size={compact ? 20 : isMobile ? 24 : 32} color={canToggleLoop ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
      </View>
      {songLoaded && !capabilities.exactSeeking && (
        <Text style={styles.capabilityDescription}>Not available for this source: exact seeking</Text>
      )}
      {songLoaded && !capabilities.repeat && (
        <Text style={styles.capabilityDescription}>Not available for this source: repeat</Text>
      )}
      {songLoaded && <Text testID="playback-current-time" style={styles.currentTime}>{currentLabel}</Text>}
    </View>
  );
};

export default AudioControls;
