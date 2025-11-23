import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon } from '../../icons';
import { playPauseButtonStyles as styles } from '../../../styles/components/controls/playPauseButton';

interface PlayPauseButtonProps {
  onTogglePlayback: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
}

const PlayPauseButton: React.FC<PlayPauseButtonProps> = ({ 
  onTogglePlayback, 
  onSkipBack, 
  onSkipForward 
}) => {
  const { isPlaying, songLoaded, currentTime, songDuration } = useStudioStore();

  const canSkipBack = songLoaded && currentTime > 0;
  const canSkipForward = songLoaded && currentTime < songDuration;

  const getPlayPauseButtonStyle = (enabled: boolean) => [
    styles.button,
    enabled ? styles.playPauseButtonEnabled : styles.buttonDisabled
  ];
  
  const getSkipButtonStyle = (enabled: boolean) => [
    styles.button,
    enabled ? styles.skipButtonEnabled : styles.buttonDisabled
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={getSkipButtonStyle(canSkipBack)}
        onPress={canSkipBack ? onSkipBack : undefined}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
      >
        <SkipBackIcon size={32} color={canSkipBack ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={getPlayPauseButtonStyle(songLoaded)}
        onPress={songLoaded ? onTogglePlayback : undefined}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
      >
        {isPlaying ? (
          <PauseIcon size={32} color={songLoaded ? "#ffffff" : "#666666"} />
        ) : (
          <PlayIcon size={32} color={songLoaded ? "#ffffff" : "#666666"} />
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={getSkipButtonStyle(canSkipForward)}
        onPress={canSkipForward ? onSkipForward : undefined}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
      >
        <SkipForwardIcon size={32} color={canSkipForward ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
    </View>
  );
};

export default PlayPauseButton;