import React from 'react';
import { Text, View } from 'react-native';

import { sidebarStyles as styles } from '../../../styles/layout/sidebar';
import BeatAnchorControl from '../controls/BeatAnchorControl';
import BpmControl from '../controls/BpmControl';
import BpmSuggestionCard from '../controls/BpmSuggestionCard';
import CountSizeControl from '../controls/CountSizeControl';
import DanceCountVisibilityControl from '../controls/DanceCountVisibilityControl';
import { updateSettingsPreferences, useSettingsPreferences } from '../../../features/settings/preferences';
import ModernToggle from '../common/ModernToggle';
import SettingsSubpage from '../settings/SettingsSubpage';

interface BpmSettingsScreenProps {
  backLabel?: string;
  onBack: () => void;
}

const BpmSettingsScreen: React.FC<BpmSettingsScreenProps> = ({ onBack, backLabel }) => {
  const { showTimingShortcut } = useSettingsPreferences();
  return (
  <SettingsSubpage title="Timing & BPM" backLabel={backLabel} onBack={onBack} testID="bpm-settings-page">
    <Text style={styles.sectionLabel}>1. Set the tempo</Text>
    <View style={styles.sidebarSection}>
      <BpmControl />
      <BpmSuggestionCard />
    </View>
    <Text style={styles.sectionLabel}>2. Choose your dance counts</Text>
    <View style={styles.sidebarSection}>
      <CountSizeControl />
      <DanceCountVisibilityControl />
    </View>
    <Text style={styles.sectionLabel}>3. Line up Count 1</Text>
    <View style={styles.sidebarSection}>
      <BeatAnchorControl />
    </View>
    <ModernToggle label="Show BPM button in toolbar" value={showTimingShortcut}
      onValueChange={value => { void updateSettingsPreferences({ showTimingShortcut: value }); }}
      testID="timing-shortcut-toggle" />
  </SettingsSubpage>
  );
};

export default BpmSettingsScreen;
