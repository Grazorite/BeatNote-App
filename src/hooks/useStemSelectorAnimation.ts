import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors } from '../styles/common';

export const useStemSelectorAnimation = (stemCount: 2 | 4 | 6) => {
  const indicatorPosition = useSharedValue(0);

  useEffect(() => {
    const position = stemCount === 2 ? 0 : stemCount === 4 ? 1 : 2;
    indicatorPosition.value = withTiming(position, { duration: 200 });
  }, [stemCount, indicatorPosition]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: indicatorPosition.value * 44 }], // 36px height + 8px gap
  }), [indicatorPosition]);

  return { indicatorStyle };
};