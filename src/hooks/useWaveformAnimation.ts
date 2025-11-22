import { useState } from 'react';
import { useSharedValue, useFrameCallback } from 'react-native-reanimated';
import { useStudioStore } from './useStudioStore';

export const useWaveformAnimation = () => {
  const offset = useSharedValue(0);
  const [pathData, setPathData] = useState('');
  const { isPlaying } = useStudioStore();

  const createWaveformPath = (offsetX: number) => {
    let path = 'M 0 150';
    for (let x = 0; x < 800; x += 4) {
      const y = 150 + Math.sin((x + offsetX) * 0.02) * 50;
      path += ` L ${x} ${y}`;
    }
    return path;
  };

  const createTimelineWaveformPath = (width: number, height: number) => {
    let path = `M 0 ${height / 2}`;
    for (let x = 0; x < width; x += 2) {
      const y = height / 2 + Math.sin(x * 0.01) * (height * 0.3);
      path += ` L ${x} ${y}`;
    }
    return path;
  };

  useFrameCallback(() => {
    if (isPlaying) {
      offset.value += 2;
      if (offset.value > 800) {
        offset.value = 0;
      }
      setPathData(createWaveformPath(offset.value));
    } else if (!pathData) {
      setPathData(createWaveformPath(0));
    }
  });

  return { pathData, createTimelineWaveformPath };
};