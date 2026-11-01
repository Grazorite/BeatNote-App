import React from 'react';
import { Text, View } from 'react-native';

import { useProductCapability } from '../../../features/entitlements/useProductCapability';
import { settingsPageStyles as styles } from '../../../styles/components/settings/settingsPage';
import SettingsInfoRow from '../settings/SettingsInfoRow';
import SettingsSubpage from '../settings/SettingsSubpage';

interface ButtonConfigurationScreenProps {
  onBack: () => void;
}

const ButtonConfigurationScreen: React.FC<ButtonConfigurationScreenProps> = ({ onBack }) => {
  const advancedSpeed = useProductCapability('playback.advancedSpeed');
  return (
    <SettingsSubpage title="Buttons" onBack={onBack} testID="button-settings-page">
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Seek Buttons</Text>
        <SettingsInfoRow
          label="Button Behaviour"
          detail="Lite · Planned. Current transport buttons keep their fixed track-navigation behaviour."
          disabled
          testID="seek-behaviour-placeholder"
        />
        <SettingsInfoRow
          label="Seek Duration"
          detail="Lite · Planned options: 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 10, 15, 20, 25, or 30 seconds."
          disabled
          testID="seek-duration-placeholder"
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Playback Speed</Text>
        <SettingsInfoRow
          label="Built-in Speed Presets"
          detail="Available in Lite and Pro with pitch preservation."
          testID="speed-presets-included"
        />
        <SettingsInfoRow
          label="Fine Slider and +/− Controls"
          detail={advancedSpeed ? 'Pro · Available in the playback speed chooser.' : 'Pro required.'}
          disabled={!advancedSpeed}
          testID="fine-speed-status"
        />
        <SettingsInfoRow
          label="Custom Range, Count, and Presets"
          detail="Planned for Pro · Includes long-press preset editing."
          disabled
          testID="custom-speed-placeholder"
        />
      </View>
    </SettingsSubpage>
  );
};

export default ButtonConfigurationScreen;
