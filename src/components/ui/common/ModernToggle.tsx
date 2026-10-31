import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { useModernToggleAnimation } from '../../../hooks/useModernToggleAnimation';
import { modernToggleStyles as styles } from '../../../styles/components/common/modernToggle';

interface ModernToggleProps {
  label: string;
  value: boolean;
  onToggle: () => void;
  disabled?: boolean;
  marginBottom?: number;
  accessibilityHint?: string;
  testID?: string;
}

const ModernToggle: React.FC<ModernToggleProps> = ({ 
  label, 
  value, 
  onToggle, 
  disabled = false,
  marginBottom = 0,
  accessibilityHint,
  testID,
}) => {
  const { trackStyle, thumbStyle } = useModernToggleAnimation(value);

  return (
    <View style={[styles.container, { marginBottom }, disabled && { opacity: 0.45 }]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        onPress={onToggle}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ checked: value, disabled }}
        aria-checked={value}
        testID={testID}
      >
        <Animated.View style={[styles.track, trackStyle]}>
          <Animated.View style={[styles.thumb, thumbStyle]} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default ModernToggle;
