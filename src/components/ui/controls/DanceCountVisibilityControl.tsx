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
        onValueChange={setShowDanceCounts}
        accessibilityHint="Shows phrase and count guidance on the waveform and transport"
        testID="dance-counts-toggle"
      />
      <Text style={styles.hint}>
        Uses the project BPM and selected phrase length; it does not detect phrases in the audio.
      </Text>
      {showDanceCounts && (
        <Text style={styles.enabled} accessibilityLiveRegion="polite" testID="dance-counts-enabled">
          Dance counts are on. Close Settings to see the live phrase/count and waveform row labels.
        </Text>
      )}
    </View>
  );
};

export default DanceCountVisibilityControl;
