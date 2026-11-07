import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform, Text, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, withTiming } from 'react-native-reanimated';
import { controlTransition } from '../../../animations/motion';
import { useModernToggleAnimation } from '../../../hooks/useModernToggleAnimation';
import { modernToggleStyles as styles } from '../../../styles/components/common/modernToggle';

interface ModernToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  /** Wait for the controlled value when a change requires confirmation. */
  optimistic?: boolean;
  marginBottom?: number;
  accessibilityHint?: string;
  testID?: string;
}

const ModernToggle: React.FC<ModernToggleProps> = ({ 
  label, 
  value, 
  onValueChange,
  disabled = false,
  optimistic = true,
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
    if (optimistic) visualValueRef.current = nextValue;
    onValueChange(nextValue);
  }, [onValueChange, optimistic]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    const nextValue = !visualValueRef.current;
    if (optimistic) setVisualValue(nextValue);
    commitValue(nextValue);
  }, [commitValue, disabled, optimistic, setVisualValue]);

  const nativeTap = useMemo(() => Gesture.Tap()
    .enabled(!disabled)
    .onEnd((_event, succeeded) => {
      if (!succeeded) return;
      // This worklet runs on the native UI thread. The switch therefore moves before expensive
      // capability/store updates can occupy the JavaScript thread.
      const nextValue = target.value === 1 ? 0 : 1;
      if (optimistic) {
        target.value = nextValue;
        progress.value = withTiming(nextValue, controlTransition);
      }
      runOnJS(commitValue)(nextValue === 1);
    }), [commitValue, disabled, optimistic, progress, target]);

  const animatedTrack = (
    <Animated.View style={[styles.track, trackStyle]}>
      <Animated.View style={[styles.thumb, thumbStyle]} />
    </Animated.View>
  );

  const row = <>
    <Text style={styles.label}>{label}</Text>
    {animatedTrack}
  </>;
  const rowStyle = [styles.container, { marginBottom }, disabled && { opacity: 0.45 }];
  const accessibility = {
    accessibilityRole: 'switch' as const, accessibilityLabel: label, accessibilityHint,
    accessibilityState: { checked: value, disabled }, testID,
  };
  return Platform.OS === 'web' ? (
    <TouchableOpacity {...accessibility} style={rowStyle} onPress={handlePress}
      disabled={disabled} activeOpacity={0.8} aria-checked={value}>{row}</TouchableOpacity>
  ) : (
    <GestureDetector gesture={nativeTap}>
      <Animated.View {...accessibility} style={rowStyle} accessible onAccessibilityTap={handlePress}>
        {row}
      </Animated.View>
    </GestureDetector>
  );
};

export default ModernToggle;
