import React from 'react';
import { Text, View } from 'react-native';

import { useProductCapability } from '../../../features/entitlements/useProductCapability';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { danceCountDisplayStyles as styles } from '../../../styles/components/controls/danceCountDisplay';
import { formatDanceCount } from '../../../utils/danceCount';

const DanceCountDisplay: React.FC = () => {
  const timingAvailable = useProductCapability('analysis.bpm');
  const label = useStudioStore(state => timingAvailable && state.songLoaded && state.showDanceCounts
    ? formatDanceCount(state.currentTime, state.gridPreview?.bpm ?? state.bpm, state.countSize,
      state.gridPreview?.beatAnchorMs ?? state.beatAnchorMs,
      state.gridPreview ? state.gridPreview.phraseStartMs : state.phraseStartMs)
    : null);
  if (label === null) return null;
  return (
    <View style={styles.container} accessible accessibilityLabel={label} testID="dance-count-display">
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

export default DanceCountDisplay;
