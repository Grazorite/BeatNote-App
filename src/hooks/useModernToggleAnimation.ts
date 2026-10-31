import {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors } from '../styles/common';

export const useModernToggleAnimation = (isEnabled: boolean) => {
  const progress = useSharedValue(isEnabled ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isEnabled ? 1 : 0, { duration: 150 });
  }, [isEnabled, progress]);

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

  return { trackStyle, thumbStyle };
};
