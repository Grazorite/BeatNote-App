import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';

export const useAnimatedCollapse = (isExpanded: boolean) => {
  const opacity = useSharedValue(isExpanded ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(isExpanded ? 1 : 0, { duration: 150 });
  }, [isExpanded, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }), [opacity]);

  return { animatedStyle, isExpanded };
};