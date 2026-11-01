import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

import { headerBackButtonStyles as styles } from '../../../styles/components/common/headerBackButton';
import { BeatNoteIcon } from '../../icons';

interface HeaderBackButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
  label?: string;
  testID?: string;
}

const HeaderBackButton: React.FC<HeaderBackButtonProps> = ({
  onPress,
  accessibilityLabel,
  label = 'Settings',
  testID,
}) => (
  <TouchableOpacity
    style={styles.button}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    testID={testID}
  >
    <BeatNoteIcon name="chevron-left" size={18} />
    <Text style={styles.label} numberOfLines={1}>{label}</Text>
  </TouchableOpacity>
);

export default React.memo(HeaderBackButton);
