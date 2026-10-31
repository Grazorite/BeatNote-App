import React from 'react';
import { Text, View } from 'react-native';

import { useProductCapability } from '../../../features/entitlements/useProductCapability';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { danceCountVisibilityControlStyles as styles } from '../../../styles/components/controls/danceCountVisibilityControl';
import ModernToggle from '../common/ModernToggle';

const WaveformVisibilityControl: React.FC = () => {
  const waveformAvailable = useProductCapability('waveform.display');
  const showWaveform = useStudioStore(state => state.showWaveform);
  const setShowWaveform = useStudioStore(state => state.setShowWaveform);

  return (
    <View style={styles.container} testID="settings-waveform">
      <ModernToggle
        label="Show waveform (Pro)"
        value={waveformAvailable && showWaveform}
        onToggle={() => {
          if (waveformAvailable) setShowWaveform(!showWaveform);
        }}
        disabled={!waveformAvailable}
        accessibilityHint={waveformAvailable
          ? 'Shows decoded waveform artwork in the canvas and overview strip'
          : 'Requires BeatNote Pro'}
        testID="waveform-visibility-toggle"
      />
      <Text style={styles.hint}>
        Off by default. Playback, seeking, markers, loops, and timing bars remain available.
      </Text>
    </View>
  );
};

export default WaveformVisibilityControl;
