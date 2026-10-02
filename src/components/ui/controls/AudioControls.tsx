import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { Play, Pause, SkipBack, SkipForward, Repeat2 } from 'lucide-react-native';
import { audioControlsStyles as styles } from '../../../styles/components/controls/audioControls';

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
  const { isPlaying, songLoaded, currentTime, songDuration, isRepeatActive, toggleRepeat } = useStudioStore();

  const canSkipBack = songLoaded && currentTime > 0;
  const canSkipForward = songLoaded && currentTime < songDuration;

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
        <SkipBack size={compact ? 20 : isMobile ? 24 : 32} color={canSkipBack ? "#ffffff" : "#666666"} />
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
        {isPlaying ? (
          <Pause size={compact ? 20 : isMobile ? 24 : 32} color={songLoaded ? "#ffffff" : "#666666"} />
        ) : (
          <Play size={compact ? 20 : isMobile ? 24 : 32} color={songLoaded ? "#ffffff" : "#666666"} />
        )}
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
        <SkipForward size={compact ? 20 : isMobile ? 24 : 32} color={canSkipForward ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={getRepeatButtonStyle(songLoaded, isRepeatActive)}
        onPress={songLoaded ? toggleRepeat : undefined}
        disabled={!songLoaded}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
      >
        <Repeat2 size={compact ? 20 : isMobile ? 24 : 32} color={songLoaded ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
    </View>
  );
};

export default AudioControls;
