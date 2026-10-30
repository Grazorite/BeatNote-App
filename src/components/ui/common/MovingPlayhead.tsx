import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { colors } from '../../../styles/common';
import {
  MOVING_PLAYHEAD_CENTER,
  MOVING_PLAYHEAD_WIDTH,
  movingPlayheadStyles as styles,
} from '../../../styles/components/common/movingPlayhead';

interface MovingPlayheadProps {
  /** Playhead centre in the parent's coordinate space. */
  x: number;
  height: number;
  headY: number;
  /** Preserve a line endpoint that differs from the containing canvas height. */
  lineBottom?: number;
  underlayTestID: string;
  lineTestID: string;
  capTestID: string;
}

interface PlayheadGlyphProps {
  height: number;
  headY: number;
  lineBottom?: number;
  underlayTestID: string;
  lineTestID: string;
  capTestID: string;
}

/**
 * Fixed-position playhead artwork. Its props never depend on playback time, so the native SVG is
 * drawn once and is never re-rasterised while the playhead moves.
 */
const PlayheadGlyph: React.FC<PlayheadGlyphProps> = ({
  height,
  headY,
  lineBottom = height,
  underlayTestID,
  lineTestID,
  capTestID,
}) => (
  <Svg width={MOVING_PLAYHEAD_WIDTH} height={height}>
    <Line
      x1={MOVING_PLAYHEAD_CENTER}
      y1={headY}
      x2={MOVING_PLAYHEAD_CENTER}
      y2={lineBottom}
      stroke={colors.background}
      strokeWidth={6}
      strokeLinecap="round"
      opacity={0.5}
      testID={underlayTestID}
    />
    <Line
      x1={MOVING_PLAYHEAD_CENTER}
      y1={headY}
      x2={MOVING_PLAYHEAD_CENTER}
      y2={lineBottom}
      stroke={colors.loopPlayhead}
      strokeWidth={2}
      strokeLinecap="round"
      testID={lineTestID}
    />
    <Circle
      cx={MOVING_PLAYHEAD_CENTER}
      cy={headY}
      r={3.5}
      fill={colors.loopPlayhead}
      stroke={colors.background}
      strokeWidth={1.5}
      testID={capTestID}
    />
  </Svg>
);

const MemoizedPlayheadGlyph = React.memo(PlayheadGlyph);

/**
 * Playhead moved with a view transform instead of redrawing SVG geometry. Physical-iPhone scrub
 * profiling showed CoreGraphics re-rasterising whole waveform SVGs whenever the playhead changed;
 * a transform is composited by Core Animation without a redraw.
 */
const MovingPlayhead: React.FC<MovingPlayheadProps> = ({ x, height, ...glyph }) => (
  <View
    pointerEvents="none"
    style={[
      styles.container,
      { height, transform: [{ translateX: x - MOVING_PLAYHEAD_CENTER }] },
    ]}
  >
    <MemoizedPlayheadGlyph height={height} {...glyph} />
  </View>
);

export default MovingPlayhead;
