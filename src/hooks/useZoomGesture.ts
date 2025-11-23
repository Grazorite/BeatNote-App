import { useRef } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useStudioStore } from './useStudioStore';

const MIN_PIXELS_PER_SECOND = 5; // Max zoom out (4 minutes visible)
const MAX_PIXELS_PER_SECOND = 800; // Max zoom in (1 second visible)
const VIEWPORT_WIDTH = 800;

export const useZoomGesture = () => {
  const { pixelsPerSecond, setPixelsPerSecond, setViewportDuration } = useStudioStore();
  const basePixelsPerSecond = useRef(pixelsPerSecond);

  const updateZoom = (scale: number) => {
    const newPixelsPerSecond = basePixelsPerSecond.current * scale;
    const clampedPPS = Math.max(MIN_PIXELS_PER_SECOND, Math.min(MAX_PIXELS_PER_SECOND, newPixelsPerSecond));
    const newDuration = (VIEWPORT_WIDTH / clampedPPS) * 1000;
    
    setPixelsPerSecond(clampedPPS);
    setViewportDuration(newDuration);
  };

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      basePixelsPerSecond.current = pixelsPerSecond;
    })
    .onUpdate((event) => {
      runOnJS(updateZoom)(event.scale);
    });

  return pinchGesture;
};