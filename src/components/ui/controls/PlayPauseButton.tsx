import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon } from '../../icons';

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

  const getButtonStyle = (enabled: boolean) => ({
    backgroundColor: enabled ? '#ff6600' : '#444444',
    borderRadius: 12,
    width: 80,
    height: 80,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    opacity: enabled ? 1 : 0.5,
  });

  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <TouchableOpacity
        style={getButtonStyle(canSkipBack)}
        onPress={canSkipBack ? onSkipBack : undefined}
        activeOpacity={1}
        delayPressIn={0}
        delayPressOut={0}
      >
        <SkipBackIcon size={32} color={canSkipBack ? "#ffffff" : "#666666"} />
      </TouchableOpacity>
      
      <TouchableOpacity
        style={getButtonStyle(songLoaded)}
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
        style={getButtonStyle(canSkipForward)}
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