import React from 'react';
import { View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import type { GridPreview } from '../../../hooks/useStudioStore';
import { colors } from '../../../styles/common';

interface GridPreviewOverlayProps {
  preview: GridPreview;
  width: number;
  height: number;
  viewportStartTime: number;
  viewportDuration: number;
  countSize: 4 | 6 | 8;
  topOffset?: number;
}

const GridPreviewOverlay: React.FC<GridPreviewOverlayProps> = ({
  preview,
  width,
  height,
  viewportStartTime,
  viewportDuration,
  countSize,
  topOffset = 0,
}) => {
  const lines = React.useMemo(() => {
    const millisecondsPerBeat = 60_000 / Math.max(1, preview.bpm);
    const originMs = preview.phraseStartMs ?? preview.beatAnchorMs;
    const startBeat = Math.floor((viewportStartTime - originMs) / millisecondsPerBeat);
    const endBeat = Math.ceil((viewportStartTime + viewportDuration - originMs) / millisecondsPerBeat);
    return Array.from({ length: Math.max(0, endBeat - startBeat + 1) }, (_, offset) => {
      const beat = startBeat + offset;
      const beatTimeMs = originMs + beat * millisecondsPerBeat;
      return {
        beat,
        x: ((beatTimeMs - viewportStartTime) / viewportDuration) * width,
        major: beat % countSize === 0,
      };
    }).filter(line => line.x >= 0 && line.x <= width);
  }, [countSize, preview, viewportDuration, viewportStartTime, width]);

  if (height <= 0) return null;
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: topOffset, left: 0, width, height }}
      testID="grid-preview-overlay"
    >
      <Svg width={width} height={height}>
        {lines.map(line => (
          <Line
            key={`preview-${line.beat}`}
            x1={line.x}
            y1={0}
            x2={line.x}
            y2={height}
            stroke={colors.accent}
            strokeDasharray={line.major ? undefined : '4 4'}
            strokeWidth={line.major ? 2 : 1}
            opacity={line.major ? 0.9 : 0.55}
          />
        ))}
      </Svg>
    </View>
  );
};

export default GridPreviewOverlay;
