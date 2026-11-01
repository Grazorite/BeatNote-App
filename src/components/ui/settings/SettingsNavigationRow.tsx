import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { settingsNavigationRowStyles as styles } from '../../../styles/components/settings/settingsNavigationRow';
import { BeatNoteIcon } from '../../icons';

interface SettingsNavigationRowProps {
  label: string;
  onPress: () => void;
  detail?: string;
  disabled?: boolean;
  testID?: string;
}

const SettingsNavigationRow: React.FC<SettingsNavigationRowProps> = ({
  label,
  onPress,
  detail,
  disabled = false,
  testID,
}) => (
  <TouchableOpacity
    style={[styles.row, disabled && styles.disabled]}
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityLabel={detail ? `${label}, ${detail}` : label}
    accessibilityState={{ disabled }}
    testID={testID}
  >
    <Text style={styles.label}>{label}</Text>
    <View style={styles.trailing}>
      {detail && <Text style={styles.detail}>{detail}</Text>}
      <BeatNoteIcon name="chevron-right" size={18} color={styles.chevron.color} />
    </View>
  </TouchableOpacity>
);

export default React.memo(SettingsNavigationRow);
