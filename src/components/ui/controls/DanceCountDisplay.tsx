import React from 'react';
import { Text, View } from 'react-native';

import { useStudioStore } from '../../../hooks/useStudioStore';
import { danceCountDisplayStyles as styles } from '../../../styles/components/controls/danceCountDisplay';
import { formatDanceCount } from '../../../utils/danceCount';

const DanceCountDisplay: React.FC = () => {
  const currentTime = useStudioStore(state => state.currentTime);
  const bpm = useStudioStore(state => state.bpm);
  const countSize = useStudioStore(state => state.countSize);
  const songLoaded = useStudioStore(state => state.songLoaded);

  if (!songLoaded) return null;

  const label = formatDanceCount(currentTime, bpm, countSize);
  return (
    <View style={styles.container} accessible accessibilityLabel={label} testID="dance-count-display">
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

export default DanceCountDisplay;
