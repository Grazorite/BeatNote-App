import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, withTiming } from 'react-native-reanimated';
import { useModernToggleAnimation } from '../../../hooks/useModernToggleAnimation';
import { modernToggleStyles as styles } from '../../../styles/components/common/modernToggle';

interface ModernToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  marginBottom?: number;
  accessibilityHint?: string;
  testID?: string;
}

const ModernToggle: React.FC<ModernToggleProps> = ({ 
  label, 
  value, 
  onValueChange,
  disabled = false,
  marginBottom = 0,
  accessibilityHint,
  testID,
}) => {
  const { progress, target, setVisualValue, trackStyle, thumbStyle } = useModernToggleAnimation(value);
  const visualValueRef = useRef(value);

  useEffect(() => {
    visualValueRef.current = value;
  }, [value]);

  const commitValue = useCallback((nextValue: boolean) => {
    visualValueRef.current = nextValue;
    onValueChange(nextValue);
  }, [onValueChange]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    const nextValue = !visualValueRef.current;
    setVisualValue(nextValue);
    commitValue(nextValue);
  }, [commitValue, disabled, setVisualValue]);

  const nativeTap = useMemo(() => Gesture.Tap()
    .enabled(!disabled)
    .onEnd((_event, succeeded) => {
      if (!succeeded) return;
      // This worklet runs on the native UI thread. The switch therefore moves before expensive
      // capability/store updates can occupy the JavaScript thread.
      const nextValue = target.value === 1 ? 0 : 1;
      target.value = nextValue;
      progress.value = withTiming(nextValue, { duration: 150 });
      runOnJS(commitValue)(nextValue === 1);
    }), [commitValue, disabled, progress, target]);

  const animatedTrack = (
    <Animated.View style={[styles.track, trackStyle]}>
      <Animated.View style={[styles.thumb, thumbStyle]} />
    </Animated.View>
  );

  return (
    <View style={[styles.container, { marginBottom }, disabled && { opacity: 0.45 }]}>
      <Text style={styles.label}>{label}</Text>
      {Platform.OS === 'web' ? (
        <TouchableOpacity
          onPress={handlePress}
          disabled={disabled}
          activeOpacity={0.8}
          accessibilityRole="switch"
          accessibilityLabel={label}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ checked: value, disabled }}
          aria-checked={value}
          testID={testID}
        >
          {animatedTrack}
        </TouchableOpacity>
      ) : (
        <GestureDetector gesture={nativeTap}>
          <Animated.View
            accessible
            accessibilityRole="switch"
            accessibilityLabel={label}
            accessibilityHint={accessibilityHint}
            accessibilityState={{ checked: value, disabled }}
            onAccessibilityTap={handlePress}
            testID={testID}
          >
            {animatedTrack}
          </Animated.View>
        </GestureDetector>
      )}
    </View>
  );
};

export default ModernToggle;
