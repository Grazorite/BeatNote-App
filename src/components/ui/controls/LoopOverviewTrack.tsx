import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G, Line, Path, Rect } from 'react-native-svg';

import { type MarkerLoopSegment, useMarkerLoopSegment } from '../../../hooks/useMarkerLoopSegment';
import type { Layer } from '../../../hooks/useStudioStore';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { generateWaveformPath, useWaveformData } from '../../../hooks/useWaveformData';
import { colors, PLAYED_WAVEFORM_OPACITY } from '../../../styles/common';
import { loopOverviewTrackStyles as styles } from '../../../styles/components/controls/loopOverviewTrack';
import { msToOverviewX, overviewPlayheadX } from '../../../utils/loopRange';
import { MARKER_SHIELD_LINE_START, MARKER_SHIELD_PATH, markerHeadTransform } from '../../../utils/markerShape';
import { incrementPerfCounter } from '../../../utils/perfCounters';
import ClipReveal from '../common/ClipReveal';
import MovingPlayhead from '../common/MovingPlayhead';

const OVERVIEW_HEIGHT = 34;
const PLAYHEAD_HEAD_Y = 5;
const OVERVIEW_PLAYHEAD_BOTTOM = 33;
const MARKER_LOOP_BAR_HEIGHT = 3;
// Simplified marker for the strip: a small solid shield on a hairline, with no annotated/plain
// distinction because the heads are too small for an outline to stay legible.
const OVERVIEW_MARKER_HEAD_SCALE = 0.55;
const OVERVIEW_MARKER_HEAD_TOP = 2;
const OVERVIEW_MARKER_LINE_TOP = OVERVIEW_MARKER_HEAD_TOP + MARKER_SHIELD_LINE_START * OVERVIEW_MARKER_HEAD_SCALE;

interface LoopOverviewTrackProps {
  audioUri: string | null;
  width: number;
}

interface LayerBaseProps {
  drawable: boolean;
  songDuration: number;
  width: number;
}

interface ProgressLayerProps extends LayerBaseProps {
  activeLayerColor: string;
  waveformPath: string;
}

interface MarkersLayerProps extends LayerBaseProps {
  layers: Layer[];
  markerLoop: MarkerLoopSegment | null;
}

interface PlayedWaveformProps {
  activeLayerColor: string;
  waveformPath: string;
  width: number;
}

/** Full-width played-colour waveform. Independent of playback time, so it is drawn once. */
const PlayedWaveform: React.FC<PlayedWaveformProps> = ({ activeLayerColor, waveformPath, width }) => (
  <Svg width={Math.max(0, width)} height={OVERVIEW_HEIGHT} pointerEvents="none">
    <Path
      d={waveformPath}
      stroke={activeLayerColor}
      strokeOpacity={PLAYED_WAVEFORM_OPACITY}
      strokeWidth={1.5}
      fill="none"
      testID="loop-overview-progress"
    />
  </Svg>
);

const MemoizedPlayedWaveform = React.memo(PlayedWaveform);

/** Played portion of the waveform, revealed by a view clip that follows playback time. */
const ProgressLayer: React.FC<ProgressLayerProps> = ({
  activeLayerColor,
  drawable,
  songDuration,
  waveformPath,
  width,
}) => {
  const playheadX = useStudioStore(state => overviewPlayheadX(state.currentTime, songDuration, width));
  if (!drawable || !waveformPath || playheadX <= 0) return null;

  return (
    <ClipReveal revealWidth={playheadX} height={OVERVIEW_HEIGHT}>
      <MemoizedPlayedWaveform
        activeLayerColor={activeLayerColor}
        waveformPath={waveformPath}
        width={width}
      />
    </ClipReveal>
  );
};

/** Marker shields. Drawn above the played waveform so its tint never recolours them. */
const MarkersLayer: React.FC<MarkersLayerProps> = ({ drawable, layers, markerLoop, songDuration, width }) => {
  if (!drawable) return null;
  const loopStartX = markerLoop ? msToOverviewX(markerLoop.loopStartMs, songDuration, width) : 0;
  const loopEndX = markerLoop ? msToOverviewX(markerLoop.loopEndMs, songDuration, width) : 0;

  return (
    <Svg
      width={Math.max(0, width)}
      height={OVERVIEW_HEIGHT}
      style={StyleSheet.absoluteFillObject}
      pointerEvents="none"
    >
      {markerLoop && loopEndX > loopStartX && (
        // "Loop between markers": a slim violet underline, deliberately without a fill so it does
        // not compete with the waveform or the teal range loop.
        <Rect
          x={loopStartX}
          y={OVERVIEW_HEIGHT - MARKER_LOOP_BAR_HEIGHT - 1}
          width={loopEndX - loopStartX}
          height={MARKER_LOOP_BAR_HEIGHT}
          rx={MARKER_LOOP_BAR_HEIGHT / 2}
          fill={colors.marker}
          opacity={0.85}
          testID="loop-overview-marker-loop"
        />
      )}
      {layers.flatMap(layer => layer.isVisible
        ? layer.markers.filter(marker => Number.isFinite(marker) && marker >= 0 && marker <= songDuration)
            .map((marker, index) => {
              const x = msToOverviewX(marker, songDuration, width);
              return (
                <G key={`${layer.id}-${marker}-${index}`}>
                  <Line
                    x1={x}
                    x2={x}
                    y1={OVERVIEW_MARKER_LINE_TOP}
                    y2={OVERVIEW_HEIGHT - 3}
                    stroke={colors.marker}
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    opacity={0.75}
                  />
                  <Path
                    d={MARKER_SHIELD_PATH}
                    transform={markerHeadTransform(x, OVERVIEW_MARKER_HEAD_TOP, OVERVIEW_MARKER_HEAD_SCALE)}
                    fill={colors.marker}
                    stroke={colors.marker}
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                  />
                </G>
              );
            })
        : [])}
    </Svg>
  );
};

/** Live playhead. Topmost layer so it is never covered by markers. */
const PlayheadLayer: React.FC<LayerBaseProps> = ({ drawable, songDuration, width }) => {
  const playheadX = useStudioStore(state => overviewPlayheadX(state.currentTime, songDuration, width));
  if (!drawable) return null;

  return (
    <MovingPlayhead
      x={playheadX}
      height={OVERVIEW_HEIGHT}
      headY={PLAYHEAD_HEAD_Y}
      lineBottom={OVERVIEW_PLAYHEAD_BOTTOM}
      underlayTestID="loop-overview-playhead-underlay"
      lineTestID="loop-overview-playhead"
      capTestID="loop-overview-playhead-cap"
    />
  );
};

const MemoizedProgressLayer = React.memo(ProgressLayer);
const MemoizedMarkersLayer = React.memo(MarkersLayer);
const MemoizedPlayheadLayer = React.memo(PlayheadLayer);

/** Render full-song timing content, visible markers, and the live playhead. */
const LoopOverviewTrack: React.FC<LoopOverviewTrackProps> = ({ audioUri, width }) => {
  const songDuration = useStudioStore(state => state.songDuration);
  const songLoaded = useStudioStore(state => state.songLoaded);
  const layers = useStudioStore(state => state.allLayersData);
  const activeLayerId = useStudioStore(state => state.activeLayerId);
  const markerLoop = useMarkerLoopSegment();
  const { waveformData } = useWaveformData(audioUri);
  const drawable = songLoaded && Number.isFinite(songDuration) && songDuration > 0 && width > 0;
  const activeLayerColor = layers.find(layer => layer.id === activeLayerId)?.color ?? colors.accent;
  const waveformPath = useMemo(() => {
    if (!drawable || waveformData?.source !== 'decoded' || waveformData.peaks.length === 0) return '';
    incrementPerfCounter('path.loopOverview');
    return generateWaveformPath(
      waveformData.peaks,
      width,
      OVERVIEW_HEIGHT,
      0,
      songDuration,
      waveformData.duration,
    );
  }, [drawable, songDuration, waveformData?.duration, waveformData?.peaks, waveformData?.source, width]);

  return (
    <View testID="loop-overview-track" style={styles.track} pointerEvents="none">
      <Svg width={Math.max(0, width)} height={OVERVIEW_HEIGHT}>
        <Rect x={0} y={0} width={Math.max(0, width)} height={OVERVIEW_HEIGHT} fill={colors.loopTrack} />
        {waveformPath ? (
          <Path
            d={waveformPath}
            stroke={colors.gridMinor}
            strokeWidth={1}
            fill="none"
            opacity={0.75}
            testID="loop-overview-peaks"
          />
        ) : (
          <Rect x={0} y={15} width={Math.max(0, width)} height={4} fill={colors.border} />
        )}
      </Svg>
      <MemoizedProgressLayer
        activeLayerColor={activeLayerColor}
        drawable={drawable}
        songDuration={songDuration}
        waveformPath={waveformPath}
        width={width}
      />
      <MemoizedMarkersLayer
        drawable={drawable}
        layers={layers}
        markerLoop={markerLoop}
        songDuration={songDuration}
        width={width}
      />
      <MemoizedPlayheadLayer drawable={drawable} songDuration={songDuration} width={width} />
    </View>
  );
};

export default React.memo(LoopOverviewTrack);
