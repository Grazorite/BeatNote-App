import React from 'react';
import { Text, View } from 'react-native';

import { sidebarStyles as styles } from '../../../styles/layout/sidebar';
import BeatAnchorControl from '../controls/BeatAnchorControl';
import BpmControl from '../controls/BpmControl';
import BpmSuggestionCard from '../controls/BpmSuggestionCard';
import CountSizeControl from '../controls/CountSizeControl';
import DanceCountVisibilityControl from '../controls/DanceCountVisibilityControl';
import SettingsSubpage from '../settings/SettingsSubpage';

interface BpmSettingsScreenProps {
  onBack: () => void;
}

const BpmSettingsScreen: React.FC<BpmSettingsScreenProps> = ({ onBack }) => (
  <SettingsSubpage title="Timing & BPM" onBack={onBack} testID="bpm-settings-page">
    <Text style={styles.sectionLabel}>Tempo</Text>
    <View style={styles.sidebarSection}>
      <BpmControl />
      <BpmSuggestionCard />
      <BeatAnchorControl />
    </View>
    <Text style={styles.sectionLabel}>Dance counts</Text>
    <View style={styles.sidebarSection}>
      <DanceCountVisibilityControl />
      <CountSizeControl />
    </View>
  </SettingsSubpage>
);

export default BpmSettingsScreen;
