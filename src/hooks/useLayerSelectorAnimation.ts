import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useEffect } from 'react';
import { LayerId } from './useStudioStore';

export const useLayerSelectorAnimation = (layerId: LayerId, isVisible: boolean, isActive: boolean, stemCount: 2 | 4 | 6) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Determine if this layer should be visible based on stem count
  const shouldBeVisible = (() => {
    const visibleLayers = {
      2: ['vocals', 'other'],
      4: ['vocals', 'drums', 'bass', 'other'],
      6: ['vocals', 'drums', 'bass', 'piano', 'guitar', 'other']
    };
    return visibleLayers[stemCount].includes(layerId);
  })();

  useEffect(() => {
    if (shouldBeVisible) {
      scale.value = withTiming(1, { duration: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(0.8, { duration: 150 });
      opacity.value = withTiming(0.3, { duration: 150 });
    }
  }, [shouldBeVisible, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }), [scale, opacity]);

  return { animatedStyle, shouldBeVisible };
};