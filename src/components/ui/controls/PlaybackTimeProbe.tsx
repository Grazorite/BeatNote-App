import React from 'react';
import { Text } from 'react-native';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { mainContentStyles } from '../../../styles/layout/mainContent';

const PlaybackTimeProbe: React.FC = () => {
  const currentTime = useStudioStore(state => state.currentTime);
  const songLoaded = useStudioStore(state => state.songLoaded);
  if (!songLoaded) return null;
  const seconds = Math.floor(Math.max(0, currentTime) / 1000);
  return (
    <Text testID="playback-current-time" style={mainContentStyles.assistiveStatus}>
      Current: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
    </Text>
  );
};

export default PlaybackTimeProbe;
