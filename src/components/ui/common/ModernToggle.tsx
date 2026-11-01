import React, { useCallback, useEffect, useRef } from 'react';
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
  const { setVisualValue, trackStyle, thumbStyle } = useModernToggleAnimation(value);
  const visualValueRef = useRef(value);

  useEffect(() => {
    visualValueRef.current = value;
  }, [value]);

  const handleToggle = useCallback(() => {
    const nextValue = !visualValueRef.current;
    visualValueRef.current = nextValue;
    setVisualValue(nextValue);
    onToggle();
  }, [onToggle, setVisualValue]);

  return (
    <View style={[styles.container, { marginBottom }, disabled && { opacity: 0.45 }]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        onPress={handleToggle}
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
