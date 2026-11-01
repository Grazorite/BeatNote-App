import React from 'react';
import { Text, View } from 'react-native';

import { settingsPageStyles as styles } from '../../../styles/components/settings/settingsPage';
import LayerNameSettings from '../controls/LayerNameSettings';
import WaveformVisibilityControl from '../controls/WaveformVisibilityControl';
import SettingsSubpage from '../settings/SettingsSubpage';

interface DisplaySettingsScreenProps {
  onBack: () => void;
}

const DisplaySettingsScreen: React.FC<DisplaySettingsScreenProps> = ({ onBack }) => (
  <SettingsSubpage
    title="Display & Annotations"
    onBack={onBack}
    testID="display-settings-page"
  >
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Waveform</Text>
      <WaveformVisibilityControl />
    </View>
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>Annotation Label</Text>
      <LayerNameSettings singleAnnotationLane />
    </View>
  </SettingsSubpage>
);

export default DisplaySettingsScreen;
