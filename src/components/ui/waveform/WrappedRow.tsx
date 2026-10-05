import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { ClipPath, Defs, Line, Path, Rect } from 'react-native-svg';
import type { LayerId } from '../../../hooks/useStudioStore';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { generateWaveformPath } from '../../../hooks/useWaveformData';
import type { WrappedRow as WrappedRowModel } from '../../../utils/rowLayout';
import { pointerToTimestamp, type RowLoopSegment } from '../../../utils/timelineMapping';
import RowGutter from './RowGutter';
import { wrappedRowStyles as styles } from '../../../styles/components/waveform/wrappedRow';
import { colors } from '../../../styles/common';

export interface WrappedLayerMarkers {
  layerId: LayerId;
  color: string;
  timestamps: number[];
}

interface WrappedRowProps {
  row: WrappedRowModel;
  rowPixelWidth: number;
  rowHeight: number;
  gutterWidth: number;
  isActiveRow: boolean;
  progress: number;
  activeLayerColor: string;
  markersByLayer: WrappedLayerMarkers[];
  peaks?: number[];
  totalDuration: number;
  loopSegment?: RowLoopSegment;
  onSeek: (positionMs: number) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
  onPlaceMarker: (timestamp: number) => void;
  onSelectMarker: (layerId: LayerId, timestamp: number) => void;
  onSelectForDetail: (rowIndex: number) => void;
}

const MARKER_LANE_HEIGHT = 44;
const MARKER_HIT_RADIUS_PX = 22;

const markerX = (row: WrappedRowModel, timestamp: number, width: number): number => {
  const duration = Math.max(1, row.endMs - row.startMs);
  return ((timestamp - row.startMs) / duration) * width;
};

interface LoopGeometry { x: number; width: number; }

/**
 * Map a RowLoopSegment into pixel geometry within the row.
 * Returns null for missing/empty/non-finite/reversed segments or when the
 * segment does not overlap the row's [startMs, endMs] window.
 */
const loopGeometry = (
  row: WrappedRowModel,
  width: number,
  segment: RowLoopSegment | undefined,
): LoopGeometry | null => {
  if (
    !segment
    || !Number.isFinite(segment.fromMs)
    || !Number.isFinite(segment.toMs)
    || segment.toMs <= segment.fromMs
    || width <= 0
  ) return null;

  const span = Math.max(0, row.endMs - row.startMs);
  if (span <= 0) return null;

  const fromMs = Math.max(segment.fromMs, row.startMs);
  const toMs = Math.min(segment.toMs, row.endMs);
  if (!(toMs > fromMs)) return null;

  const x = Math.min(width, Math.max(0, ((fromMs - row.startMs) / span) * width));
  const right = Math.min(width, Math.max(0, ((toMs - row.startMs) / span) * width));
  const rectWidth = Math.max(0, right - x);
  if (rectWidth <= 0) return null;

  return { x, width: rectWidth };
};

const WrappedRow: React.FC<WrappedRowProps> = ({
  row,
  rowPixelWidth,
  rowHeight,
  gutterWidth,
  isActiveRow,
  progress,
  activeLayerColor,
  markersByLayer,
  peaks,
  totalDuration,
  loopSegment,
  onSeek,
  onScrubStart,
  onScrubEnd,
  onPlaceMarker,
  onSelectMarker,
  onSelectForDetail,
}) => {
  const setCurrentTime = useStudioStore(state => state.setCurrentTime);
  const setGhostPlayheadTime = useStudioStore(state => state.setGhostPlayheadTime);
  const safeProgress = Math.max(0, Math.min(1, progress));
  const activeWidth = rowPixelWidth * safeProgress;
  const playheadX = rowPixelWidth > 2
    ? Math.max(1, Math.min(rowPixelWidth - 1, activeWidth))
    : rowPixelWidth / 2;
  const waveformHeight = Math.max(1, rowHeight - 2);
  const clipId = `wrapped-row-progress-${row.index}`;
  const loopRect = loopGeometry(row, rowPixelWidth, loopSegment);
  const path = useMemo(() => {
    if (!peaks?.length || rowPixelWidth <= 0 || totalDuration <= 0) return '';
    return generateWaveformPath(
      peaks,
      rowPixelWidth,
      waveformHeight,
      row.startMs,
      row.endMs - row.startMs,
      totalDuration,
    );
  }, [peaks, row.endMs, row.startMs, rowPixelWidth, totalDuration, waveformHeight]);

  const timeAtPosition = (x: number) => pointerToTimestamp({ row, rowPixelWidth }, x);
  const markerAtPosition = (x: number) => {
    let closest: { layerId: LayerId; timestamp: number; distance: number } | null = null;
    markersByLayer.forEach(layer => layer.timestamps.forEach(timestamp => {
      const distance = Math.abs(markerX(row, timestamp, rowPixelWidth) - x);
      if (distance <= MARKER_HIT_RADIUS_PX && (!closest || distance < closest.distance)) {
        closest = { layerId: layer.layerId, timestamp, distance };
      }
    }));
    return closest as { layerId: LayerId; timestamp: number; distance: number } | null;
  };

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .maxDuration(250)
    .onEnd(event => {
      const targetTime = timeAtPosition(event.x);
      if (event.y <= MARKER_LANE_HEIGHT) {
        const marker = markerAtPosition(event.x);
        if (marker) {
          onSelectMarker(marker.layerId, marker.timestamp);
          onSeek(marker.timestamp);
        } else {
          onPlaceMarker(targetTime);
          onSeek(targetTime);
        }
        return;
      }
      onSeek(targetTime);
    });

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-6, 6])
    .failOffsetY([-12, 12])
    .onBegin(() => onScrubStart())
    .onUpdate(event => {
      const targetTime = timeAtPosition(event.x);
      setCurrentTime(targetTime);
      setGhostPlayheadTime(targetTime);
    })
    .onFinalize(() => {
      setGhostPlayheadTime(null);
      onScrubEnd();
    });

  const composedGesture = Gesture.Race(tapGesture, panGesture);

  return (
    <View style={[styles.row, { height: rowHeight }]} testID={`wrapped-row-${row.index}`}>
      <Pressable
        accessibilityLabel={`Open detail editor for row ${row.index + 1}`}
        accessibilityRole="button"
        onPress={() => onSelectForDetail(row.index)}
        style={({ pressed }) => pressed && styles.gutterPressed}
        testID={`wrapped-row-detail-${row.index}`}
      >
        <RowGutter
          startMs={row.startMs}
          phraseNumber={row.phraseNumber}
          countLabel={row.countLabel}
          width={gutterWidth}
          testID={`wrapped-row-gutter-${row.index}`}
        />
      </Pressable>
      <GestureDetector gesture={composedGesture}>
        <View
          style={[styles.canvas, { width: rowPixelWidth, height: waveformHeight }]}
          testID={`wrapped-row-gesture-area-${row.index}`}
        >
          <Svg
            width={rowPixelWidth}
            height={waveformHeight}
            testID={`wrapped-row-waveform-${row.index}`}
          >
          {loopRect && (
            <Rect
              x={loopRect.x}
              y={0}
              width={loopRect.width}
              height={waveformHeight}
              fill={colors.accent}
              opacity={0.15}
              testID={`wrapped-row-loop-${row.index}`}
            />
          )}
          <Rect
            x={0}
            y={0}
            width={rowPixelWidth}
            height={Math.min(MARKER_LANE_HEIGHT, waveformHeight)}
            fill={activeLayerColor}
            opacity={0.05}
            testID={`wrapped-row-marker-lane-${row.index}`}
          />
          <Line
            x1={0}
            y1={Math.min(MARKER_LANE_HEIGHT, waveformHeight)}
            x2={rowPixelWidth}
            y2={Math.min(MARKER_LANE_HEIGHT, waveformHeight)}
            stroke={colors.gridMinor}
            strokeWidth={1}
            opacity={0.45}
          />
          {path ? (
            <>
              <Path d={path} stroke={colors.gridMinor} strokeWidth={1} fill="none" opacity={0.75} />
              {activeWidth > 0 && (
                <>
                  <Defs>
                    <ClipPath id={clipId}>
                      <Rect x={0} y={0} width={activeWidth} height={waveformHeight} />
                    </ClipPath>
                  </Defs>
                  <Path
                    d={path}
                    stroke={activeLayerColor}
                    strokeWidth={1.5}
                    fill="none"
                    clipPath={`url(#${clipId})`}
                    testID={`wrapped-row-progress-${row.index}`}
                  />
                </>
              )}
            </>
          ) : (
            <>
              <Rect
                x={0}
                y={(waveformHeight / 2) - 3}
                width={rowPixelWidth}
                height={6}
                fill={colors.gridMinor}
                opacity={0.65}
              />
              {activeWidth > 0 && (
                <Rect
                  x={0}
                  y={(waveformHeight / 2) - 3}
                  width={activeWidth}
                  height={6}
                  fill={activeLayerColor}
                  testID={`wrapped-row-progress-${row.index}`}
                />
              )}
            </>
          )}

          {markersByLayer.flatMap(layer => layer.timestamps.map(timestamp => (
            <Line
              key={`${layer.layerId}-${timestamp}`}
              x1={markerX(row, timestamp, rowPixelWidth)}
              y1={0}
              x2={markerX(row, timestamp, rowPixelWidth)}
              y2={waveformHeight}
              stroke={layer.color}
              strokeWidth={3}
              opacity={0.9}
              testID={`wrapped-row-marker-${layer.layerId}-${timestamp}`}
            />
          )))}

          {isActiveRow && (
            <Line
              x1={playheadX}
              y1={0}
              x2={playheadX}
              y2={waveformHeight}
              stroke={colors.accent}
              strokeWidth={2}
              testID={`wrapped-row-playhead-${row.index}`}
            />
          )}
          </Svg>
        </View>
      </GestureDetector>
    </View>
  );
};

export default React.memo(WrappedRow);
