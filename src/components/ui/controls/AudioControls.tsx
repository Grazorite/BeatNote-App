import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { BeatNoteIcon } from '../../icons';
import { audioControlsStyles as styles } from '../../../styles/components/controls/audioControls';
import { isValidLoopRange } from '../../../utils/loopRange';

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
  } = useStudioStore(useShallow(state => ({
    isPlaying: state.isPlaying,
    songLoaded: state.songLoaded,
    currentTime: state.currentTime,
    songDuration: state.songDuration,
    isRepeatActive: state.isRepeatActive,
    toggleRepeat: state.toggleRepeat,
    isLoopRangeEnabled: state.isLoopRangeEnabled,
    toggleLoopRangeEnabled: state.toggleLoopRangeEnabled,
  })));
  const canToggleLoop = useStudioStore(state => state.songLoaded && isValidLoopRange(state, state.songDuration));

  const canSkipBack = songLoaded && currentTime > 0;
  const canSkipForward = songLoaded && currentTime < songDuration;
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
        disabled={!songLoaded}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
        testID="skip-back"
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
      >
        <BeatNoteIcon name="next" size={compact ? 20 : isMobile ? 24 : 32} color={canSkipForward ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={getRepeatButtonStyle(songLoaded, isRepeatActive)}
        onPress={songLoaded ? toggleRepeat : undefined}
        disabled={!songLoaded}
        testID="repeat-toggle"
        accessibilityRole="button"
        accessibilityLabel="Repeat song"
        accessibilityState={{ checked: isRepeatActive, disabled: !songLoaded }}
        aria-pressed={isRepeatActive}
        aria-disabled={!songLoaded}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
      >
        <BeatNoteIcon name="repeat" size={compact ? 20 : isMobile ? 24 : 32} color={songLoaded ? "#ffffff" : "#666666"} />
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
      {songLoaded && <Text testID="playback-current-time" style={styles.currentTime}>{currentLabel}</Text>}
    </View>
  );
};

export default AudioControls;
