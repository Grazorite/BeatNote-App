import React, { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { cancelAnimation, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../../styles/common';

interface Props {
  size: number;
  halfWidth: number;
  halfHeight: number;
  travel: number;
  style: StyleProp<ViewStyle>;
  repeatEveryMs?: number;
}

// Mount on a beat for a single emission, or repeat while the control is visible.
export default function OutwardSparkle({ size, halfWidth, halfHeight, travel, style, repeatEveryMs }: Props) {
  const progress = useSharedValue(0);
  const direction = useSharedValue(0);
  useEffect(() => {
    const emit = () => {
      progress.value = 0;
      direction.value = Math.random() * Math.PI * 2;
      progress.value = withTiming(1, { duration: 650 });
    };
    emit();
    const timer = repeatEveryMs ? setInterval(emit, repeatEveryMs) : undefined;
    return () => {
      clearInterval(timer);
      cancelAnimation(progress);
    };
  }, [direction, progress, repeatEveryMs]);

  const movement = useAnimatedStyle(() => {
    const x = Math.cos(direction.value);
    const y = Math.sin(direction.value);
    // Intersect the ray with the control's edge before moving outwards.
    const distance = 1 / Math.max(Math.abs(x) / halfWidth, Math.abs(y) / halfHeight) + progress.value * travel;
    return {
      opacity: interpolate(progress.value, [0, 0.2, 0.55, 1], [0, 1, 0.8, 0]),
      transform: [
        { translateX: x * distance },
        { translateY: y * distance },
        { scale: interpolate(progress.value, [0, 0.25, 1], [0.3, 1, 0.5]) },
        { rotate: `${progress.value * 30}deg` },
      ],
    };
  });

  return (
    <Animated.View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[style, movement]}>
      <Svg width={size} height={size} viewBox="0 0 20 20">
        <Path d="M10 1 Q11.5 8.5 19 10 Q11.5 11.5 10 19 Q8.5 11.5 1 10 Q8.5 8.5 10 1Z" fill={colors.accent} />
      </Svg>
    </Animated.View>
  );
}
