import { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors } from '../styles/common';

export const useModernToggleAnimation = (isEnabled: boolean) => {
  const thumbPosition = useSharedValue(isEnabled ? 1 : 0);
  const trackOpacity = useSharedValue(isEnabled ? 1 : 0.3);

  useEffect(() => {
    thumbPosition.value = withSpring(isEnabled ? 1 : 0, {
      damping: 12,
      stiffness: 200,
    });
    trackOpacity.value = withTiming(isEnabled ? 1 : 0.3, { duration: 100 });
  }, [isEnabled, thumbPosition, trackOpacity]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(
      isEnabled ? colors.accent : colors.border,
      { duration: 100 }
    ),
    opacity: trackOpacity.value,
  }), [isEnabled, trackOpacity]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbPosition.value * 20 }],
    backgroundColor: colors.background,
  }), [thumbPosition]);

  const labelStyle = useAnimatedStyle(() => ({
    color: withTiming(
      isEnabled ? colors.text : colors.textSecondary,
      { duration: 100 }
    ),
  }), [isEnabled]);

  return { trackStyle, thumbStyle, labelStyle };
};