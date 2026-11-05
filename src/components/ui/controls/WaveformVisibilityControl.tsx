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
        label="Show waveform"
        value={waveformAvailable && showWaveform}
        onValueChange={enabled => {
          if (waveformAvailable) setShowWaveform(enabled);
        }}
        disabled={!waveformAvailable}
        accessibilityHint={waveformAvailable
          ? 'Show the waveform on the timeline and overview'
          : 'Requires BeatNote Pro'}
        testID="waveform-visibility-toggle"
      />
      <Text style={styles.hint}>
        {waveformAvailable ? 'Show the shape of your song on the timeline and overview.' : 'Pro only'}
      </Text>
    </View>
  );
};

export default WaveformVisibilityControl;
