import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { useStudioStore } from '../../../hooks/useStudioStore';
import type { WrappedRow as WrappedRowModel } from '../../../utils/rowLayout';
import { clipRowProgress } from '../../../utils/timelineMapping';
import { PLAYED_WAVEFORM_OPACITY } from '../../../styles/common';
import { wrappedRowLiveLayersStyles as styles } from '../../../styles/components/waveform/wrappedRowLiveLayers';
import ClipReveal from '../common/ClipReveal';
import MovingPlayhead from '../common/MovingPlayhead';

// Playback-time–driven parts of a wrapped row. They are the only row components subscribed to
// `currentTime`, and they move or clip fixed native content rather than changing SVG geometry, so
// a seek or scrub never re-rasterises the row's waveform, markers, or loop artwork.

const PLAYHEAD_HEAD_Y = 5;

/** Format milliseconds as `m:ss` for row and marker accessibility labels. */
export const formatAccessibleTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(Math.max(0, milliseconds) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
const PLACEHOLDER_BAR_HEIGHT = 6;

/** Clamped 0…1 progress through `row`; constant for rows the playhead is not inside. */
const useRowProgress = (row: WrappedRowModel): number => {
  const progress = useStudioStore(state => clipRowProgress(row, state.currentTime));
  return Math.max(0, Math.min(1, progress));
};

interface PlayedArtworkProps {
  path: string;
  width: number;
  height: number;
  color: string;
  rowIndex: number;
}

/** Full-width played-colour artwork. Independent of playback time, so it is drawn once. */
const PlayedArtwork: React.FC<PlayedArtworkProps> = ({ path, width, height, color, rowIndex }) => (
  <Svg width={width} height={height} pointerEvents="none">
    {path ? (
      <Path
        d={path}
        stroke={color}
        strokeOpacity={PLAYED_WAVEFORM_OPACITY}
        strokeWidth={1.5}
        fill="none"
        testID={`wrapped-row-progress-${rowIndex}`}
      />
    ) : (
      <Rect
        x={0}
        y={(height / 2) - PLACEHOLDER_BAR_HEIGHT / 2}
        width={width}
        height={PLACEHOLDER_BAR_HEIGHT}
        fill={color}
        testID={`wrapped-row-progress-${rowIndex}`}
      />
    )}
  </Svg>
);

const MemoizedPlayedArtwork = React.memo(PlayedArtwork);

interface RowProgressLayerProps {
  row: WrappedRowModel;
  path: string;
  rowPixelWidth: number;
  waveformHeight: number;
  activeLayerColor: string;
}

/** Played portion of the row, revealed with a view clip. */
export const RowProgressLayer: React.FC<RowProgressLayerProps> = ({
  row,
  path,
  rowPixelWidth,
  waveformHeight,
  activeLayerColor,
}) => {
  const activeWidth = rowPixelWidth * useRowProgress(row);
  return (
    <ClipReveal revealWidth={activeWidth} height={waveformHeight}>
      <MemoizedPlayedArtwork
        path={path}
        width={rowPixelWidth}
        height={waveformHeight}
        color={activeLayerColor}
        rowIndex={row.index}
      />
    </ClipReveal>
  );
};

interface RowPlayheadProps {
  row: WrappedRowModel;
  rowPixelWidth: number;
  waveformHeight: number;
}

/** Live playhead for the active row, moved by transform. */
export const RowPlayhead: React.FC<RowPlayheadProps> = ({ row, rowPixelWidth, waveformHeight }) => {
  const activeWidth = rowPixelWidth * useRowProgress(row);
  const playheadX = rowPixelWidth > 2
    ? Math.max(1, Math.min(rowPixelWidth - 1, activeWidth))
    : rowPixelWidth / 2;
  return (
    <MovingPlayhead
      x={playheadX}
      height={waveformHeight}
      headY={PLAYHEAD_HEAD_Y}
      underlayTestID={`wrapped-row-playhead-underlay-${row.index}`}
      lineTestID={`wrapped-row-playhead-${row.index}`}
      capTestID={`wrapped-row-playhead-cap-${row.index}`}
    />
  );
};

interface RowAccessibleSurfaceProps {
  row: WrappedRowModel;
  label: string;
  isActiveRow: boolean;
}

/** Adjustable accessibility surface; only the active row reports a live playback value. */
export const RowAccessibleSurface: React.FC<RowAccessibleSurfaceProps> = ({ row, label, isActiveRow }) => {
  const progress = useRowProgress(row);
  const rowDuration = Math.max(0, row.endMs - row.startMs);
  const playbackPosition = Math.round(row.startMs + rowDuration * progress);
  const playbackValueText = `Playback at ${formatAccessibleTime(playbackPosition)}`;
  return (
    <View
      accessible
      accessibilityLabel={label}
      accessibilityRole="adjustable"
      accessibilityValue={isActiveRow ? {
        min: row.startMs,
        max: row.endMs,
        now: playbackPosition,
        text: playbackValueText,
      } : undefined}
      aria-valuemax={isActiveRow ? row.endMs : undefined}
      aria-valuemin={isActiveRow ? row.startMs : undefined}
      aria-valuenow={isActiveRow ? playbackPosition : undefined}
      aria-valuetext={isActiveRow ? playbackValueText : undefined}
      pointerEvents="none"
      style={styles.accessibleSurface}
      testID={`wrapped-row-${row.index}`}
    />
  );
};
