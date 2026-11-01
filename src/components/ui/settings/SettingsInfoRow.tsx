import React from 'react';
import { Text, View } from 'react-native';

import { settingsPageStyles as styles } from '../../../styles/components/settings/settingsPage';

interface SettingsInfoRowProps {
  label: string;
  detail: string;
  disabled?: boolean;
  testID?: string;
}

const SettingsInfoRow: React.FC<SettingsInfoRowProps> = ({
  label,
  detail,
  disabled = false,
  testID,
}) => (
  <View
    style={[styles.infoRow, disabled && styles.disabled]}
    accessibilityLabel={`${label}, ${detail}`}
    testID={testID}
  >
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowDetail}>{detail}</Text>
  </View>
);

export default React.memo(SettingsInfoRow);
