import {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useCallback, useEffect } from 'react';
import { colors } from '../styles/common';

export const useModernToggleAnimation = (isEnabled: boolean) => {
  const progress = useSharedValue(isEnabled ? 1 : 0);

  const setVisualValue = useCallback((enabled: boolean) => {
    // Schedule the visual response immediately instead of waiting for a potentially expensive
    // parent/store render to commit the controlled value.
    progress.value = withTiming(enabled ? 1 : 0, { duration: 150 });
  }, [progress]);

  useEffect(() => {
    setVisualValue(isEnabled);
  }, [isEnabled, setVisualValue]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.border, colors.accent],
    ),
  }), [progress]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * 20 }],
    backgroundColor: colors.text,
  }), [progress]);

  return { setVisualValue, trackStyle, thumbStyle };
};
