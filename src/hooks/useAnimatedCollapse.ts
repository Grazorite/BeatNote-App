import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { controlTransition } from '../animations/motion';

export const useAnimatedCollapse = (isExpanded: boolean) => {
  const opacity = useSharedValue(isExpanded ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(isExpanded ? 1 : 0, controlTransition);
  }, [isExpanded, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }), [opacity]);

  return { animatedStyle, isExpanded };
};