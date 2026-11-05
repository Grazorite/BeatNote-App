import React from 'react';
import { Text, View } from 'react-native';

import { useStudioStore } from '../../../hooks/useStudioStore';
import { danceCountVisibilityControlStyles as styles } from '../../../styles/components/controls/danceCountVisibilityControl';
import ModernToggle from '../common/ModernToggle';

const DanceCountVisibilityControl: React.FC = () => {
  const showDanceCounts = useStudioStore(state => state.showDanceCounts);
  const setShowDanceCounts = useStudioStore(state => state.setShowDanceCounts);

  const showGrid = useStudioStore(state => state.showGridLines);
  const setShowGrid = useStudioStore(state => state.setShowGridLines);

  return (
    <View style={styles.container} testID="settings-dance-counts">
      <ModernToggle label="Show dance grid" value={showGrid} onValueChange={setShowGrid} testID="dance-grid-toggle" />
      <Text style={styles.hint}>Silver dots mark each beat. Brighter white dots mark Count 1.</Text>
      <ModernToggle
        label="Show dance counts"
        value={showDanceCounts}
        onValueChange={setShowDanceCounts}
        accessibilityHint="Show the phrase and count during playback"
        testID="dance-counts-toggle"
      />
      <Text style={styles.hint}>
        Counts follow your project BPM and phrase length.
      </Text>
      {showDanceCounts && (
        <Text style={styles.enabled} accessibilityLiveRegion="polite" testID="dance-counts-enabled">
          Look for counts beside the waveform and playback controls.
        </Text>
      )}
    </View>
  );
};

export default DanceCountVisibilityControl;
