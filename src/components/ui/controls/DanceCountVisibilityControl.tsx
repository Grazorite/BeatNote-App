import React from 'react';
import { Text, View } from 'react-native';

import { useStudioStore } from '../../../hooks/useStudioStore';
import { danceCountVisibilityControlStyles as styles } from '../../../styles/components/controls/danceCountVisibilityControl';
import ModernToggle from '../common/ModernToggle';

const DanceCountVisibilityControl: React.FC = () => {
  const showDanceCounts = useStudioStore(state => state.showDanceCounts);
  const setShowDanceCounts = useStudioStore(state => state.setShowDanceCounts);

  return (
    <View style={styles.container} testID="settings-dance-counts">
      <ModernToggle
        label="Show dance counts"
        value={showDanceCounts}
        onToggle={() => setShowDanceCounts(!showDanceCounts)}
        accessibilityHint="Shows phrase and count guidance on the waveform and transport"
        testID="dance-counts-toggle"
      />
      <Text style={styles.hint}>
        Uses the project BPM and selected phrase length; it does not detect phrases in the audio.
      </Text>
    </View>
  );
};

export default DanceCountVisibilityControl;
