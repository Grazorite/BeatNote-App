import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { Layer } from '../../../hooks/useStudioStore';
import { useStudioStore } from '../../../hooks/useStudioStore';
import { useProductCapability } from '../../../features/entitlements/useProductCapability';
import { useWaveformData } from '../../../hooks/useWaveformData';
import { useWrappedRows } from '../../../hooks/useWrappedRows';
import {
  resolveGutterWidth,
  resolveRowDensity,
  resolveRowHeight,
  computeVisibleRange,
  type WrappedRow as WrappedRowModel,
} from '../../../utils/rowLayout';
import {
  loopSegmentsForRows,
  scrubPointerToTimestamp,
  timestampToRow,
  type RowLoopSegment,
} from '../../../utils/timelineMapping';
import { isValidLoopRange, outsideLoopSegmentsForRow } from '../../../utils/loopRange';
import { useMarkerLoopSegment } from '../../../hooks/useMarkerLoopSegment';
import WrappedRow, { type WrappedLayerMarkers } from './WrappedRow';
import RowDensityControls from './RowDensityControls';
import { wrappedWaveformStyles as styles } from '../../../styles/components/waveform/wrappedWaveform';
import { colors } from '../../../styles/common';
import { getLayerDisplayName } from '../../../utils/layers';

interface WrappedWaveformProps {
  audioUri?: string;
  layers: Layer[];
  onSeek: (positionMs: number) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
  onSelectForDetail: (rowIndex: number) => void;
  isMobile?: boolean;
  isLandscape: boolean;
}

const MOBILE_TARGET_ROW_HEIGHT = 56;
const MOBILE_GUTTER_WIDTH = 52;
const EMPTY_MARKERS: WrappedLayerMarkers[] = [];
// Trailing edge zone that continues an active scrub into the next row.
const SCRUB_EDGE_ZONE_PX = 20;
// Time to auto-advance through one full row while holding at an edge.
const SCRUB_EDGE_ROW_MS = 1500;

const WrappedWaveform: React.FC<WrappedWaveformProps> = ({
  audioUri,
  layers,
  onSeek,
  onScrubStart,
  onScrubEnd,
  onSelectForDetail,
  isMobile = false,
  isLandscape: requestedLandscape,
}) => {
  const songDuration = useStudioStore(state => state.songDuration);
  const songLoaded = useStudioStore(state => state.songLoaded);
  const activeLayerId = useStudioStore(state => state.activeLayerId);
  const isPlaying = useStudioStore(state => state.isPlaying);
  const followPlayhead = useStudioStore(state => state.followPlayhead);
  const loopStartMs = useStudioStore(state => state.loopStartMs);
  const loopEndMs = useStudioStore(state => state.loopEndMs);
  const isLoopRangeEnabled = useStudioStore(state => state.isLoopRangeEnabled);
  const rowDensity = useStudioStore(state => state.rowDensity);
  const setFollowPlayhead = useStudioStore(state => state.setFollowPlayhead);
  const setRowDensity = useStudioStore(state => state.setRowDensity);
  const setSelectedMarker = useStudioStore(state => state.setSelectedMarker);
  const selectedRowIndex = useStudioStore(state => state.selectedRowIndex);
  const [viewportLayout, setViewportLayout] = useState({
    width: 1,
    height: requestedLandscape ? 288 : 336,
    isLandscape: requestedLandscape,
  });
  const [scrollOffset, setScrollOffset] = useState(0);
  const [followSuspended, setFollowSuspended] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const suspendedSawActiveOutside = useRef(false);
  const availableWidth = viewportLayout.width;
  const containerHeight = viewportLayout.height;
  const isLandscape = viewportLayout.isLandscape;
  const fittedRowCount = isMobile
    ? Math.max(1, Math.ceil(containerHeight / MOBILE_TARGET_ROW_HEIGHT))
    : undefined;
  const rowHeight = isMobile && fittedRowCount != null
    ? containerHeight / fittedRowCount
    : resolveRowHeight(isLandscape);
  const gutterWidth = resolveGutterWidth(isLandscape, isMobile ? MOBILE_GUTTER_WIDTH : undefined);
  const effectiveRowDensity = resolveRowDensity(rowDensity, isLandscape);
  const showWaveform = useStudioStore(state => state.showWaveform);
  const waveformAvailable = useProductCapability('waveform.display');
  const waveformEnabled = showWaveform && waveformAvailable;
  const { waveformData, loading } = useWaveformData(waveformEnabled ? audioUri || null : null);
  const { rows, visibleRange, rowPixelWidth, activeRowIndex } = useWrappedRows(
    availableWidth,
    isLandscape,
    { scrollOffset, containerHeight, rowHeight, gutterWidth, fittedRowCount },
  );

  const visibleRows = useMemo(
    () => visibleRange.lastIndex >= visibleRange.firstIndex
      ? rows.slice(visibleRange.firstIndex, visibleRange.lastIndex + 1)
      : [],
    [rows, visibleRange.firstIndex, visibleRange.lastIndex],
  );
  const viewportRange = useMemo(() => computeVisibleRange(
    rows.length,
    scrollOffset,
    containerHeight,
    rowHeight,
    0,
  ), [containerHeight, rowHeight, rows.length, scrollOffset]);
  const topSpacerHeight = visibleRange.firstIndex * rowHeight;
  const bottomSpacerHeight = Math.max(0, rows.length - visibleRange.lastIndex - 1) * rowHeight;
  const activeLayerColor = layers.find(layer => layer.id === activeLayerId)?.color || colors.accent;
  const realPeaks = waveformData?.source === 'decoded' ? waveformData.peaks : undefined;
  const peakDuration = waveformData?.source === 'decoded' ? waveformData.duration : songDuration;
  const loopSegmentsByRow = useMemo(() => {
    if (!isValidLoopRange({ loopStartMs, loopEndMs }, songDuration)) return new Map();
    return new Map(
      loopSegmentsForRows(rows, loopStartMs as number, loopEndMs as number)
        .map(segment => [segment.rowIndex, segment] as const),
    );
  }, [loopEndMs, loopStartMs, rows, songDuration]);
  const markerLoop = useMarkerLoopSegment();
  const markerLoopSegmentsByRow = useMemo(() => {
    if (!markerLoop) return new Map<number, RowLoopSegment>();
    return new Map(
      loopSegmentsForRows(rows, markerLoop.loopStartMs, markerLoop.loopEndMs)
        .map(segment => [segment.rowIndex, segment] as const),
    );
  }, [markerLoop, rows]);
  const outsideLoopSegmentsByRow = useMemo(() => {
    const range = { loopStartMs, loopEndMs };
    if (!isLoopRangeEnabled || !isValidLoopRange(range, songDuration)) {
      return new Map<number, RowLoopSegment[]>();
    }
    return new Map(rows.map(row => [
      row.index,
      outsideLoopSegmentsForRow(row.startMs, row.endMs, range).map(segment => ({
        rowIndex: row.index,
        ...segment,
      })),
    ]));
  }, [isLoopRangeEnabled, loopEndMs, loopStartMs, rows, songDuration]);

  const markersByRow = useMemo(() => new Map(rows.map(row => [
    row.index,
    layers
      .filter(layer => layer.isVisible)
      .map(layer => ({
        layerId: layer.id,
        name: getLayerDisplayName(layer),
        color: layer.color,
        timestamps: layer.markers.filter(timestamp => timestampToRow(rows, timestamp) === row.index),
        annotatedTimestamps: layer.markers.filter(timestamp =>
          timestampToRow(rows, timestamp) === row.index
          && layer.annotations.some(annotation =>
            annotation.text.trim().length > 0
            && Math.abs(annotation.timestamp - timestamp) < 100)),
      }))
      .filter(layer => layer.timestamps.length > 0),
  ] as const)), [layers, rows]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setViewportLayout(current => {
      const nextLandscape = width > height;
      if (Math.abs(current.width - width) <= 1
        && Math.abs(current.height - height) <= 1
        && current.isLandscape === nextLandscape) return current;
      return { width: Math.max(1, width), height: Math.max(1, height), isLandscape: nextLandscape };
    });
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollOffset(Math.max(0, event.nativeEvent.contentOffset.y));
  }, []);

  const handleManualScrollStart = useCallback(() => {
    if (!followPlayhead) return;
    const activeIsVisible = activeRowIndex >= viewportRange.firstIndex
      && activeRowIndex <= viewportRange.lastIndex;
    suspendedSawActiveOutside.current = !activeIsVisible;
    setFollowSuspended(true);
  }, [activeRowIndex, followPlayhead, viewportRange.firstIndex, viewportRange.lastIndex]);

  const centerActiveRow = useCallback((animated: boolean) => {
    if (isMobile || activeRowIndex < 0 || rows.length === 0) return;
    const centeredOffset = activeRowIndex * rowHeight - (containerHeight - rowHeight) / 2;
    const maxOffset = Math.max(0, rows.length * rowHeight - containerHeight);
    scrollRef.current?.scrollTo({
      y: Math.max(0, Math.min(centeredOffset, maxOffset)),
      animated,
    });
  }, [activeRowIndex, containerHeight, isMobile, rowHeight, rows.length]);

  useEffect(() => {
    if (isMobile) return;
    if (!followPlayhead) {
      suspendedSawActiveOutside.current = false;
      setFollowSuspended(false);
      return;
    }
    if (isPlaying && !followSuspended) centerActiveRow(true);
  }, [activeRowIndex, centerActiveRow, followPlayhead, followSuspended, isMobile, isPlaying]);

  useEffect(() => {
    if (isMobile) return;
    if (selectedRowIndex == null || selectedRowIndex < 0 || selectedRowIndex >= rows.length) return;
    const centeredOffset = selectedRowIndex * rowHeight - (containerHeight - rowHeight) / 2;
    const maxOffset = Math.max(0, rows.length * rowHeight - containerHeight);
    scrollRef.current?.scrollTo({
      y: Math.max(0, Math.min(centeredOffset, maxOffset)),
      animated: false,
    });
  }, [containerHeight, isMobile, rowHeight, rows.length, selectedRowIndex]);

  useEffect(() => {
    if (isMobile) return;
    if (!followSuspended || !followPlayhead || !isPlaying || activeRowIndex < 0) return;
    const activeIsVisible = activeRowIndex >= viewportRange.firstIndex
      && activeRowIndex <= viewportRange.lastIndex;
    if (!activeIsVisible) {
      suspendedSawActiveOutside.current = true;
    } else if (suspendedSawActiveOutside.current) {
      suspendedSawActiveOutside.current = false;
      setFollowSuspended(false);
    }
  }, [
    activeRowIndex,
    followPlayhead,
    followSuspended,
    isPlaying,
    isMobile,
    viewportRange.firstIndex,
    viewportRange.lastIndex,
  ]);

  const handleFollowToggle = useCallback(() => {
    if (!followPlayhead) {
      setFollowPlayhead(true);
      setFollowSuspended(false);
      suspendedSawActiveOutside.current = false;
      return;
    }
    if (followSuspended) {
      setFollowSuspended(false);
      suspendedSawActiveOutside.current = false;
      centerActiveRow(true);
      return;
    }
    setFollowPlayhead(false);
  }, [centerActiveRow, followPlayhead, followSuspended, setFollowPlayhead]);
  const webManualScrollProps = Platform.OS === 'web'
    ? { onWheel: handleManualScrollStart }
    : {};

  // One scrub gesture spans every row so an activated horizontal drag can travel across rows.
  // Geometry and callbacks are read from a ref, keeping the gesture object stable while playback,
  // scrolling, and the scrub itself re-render this component.
  const scrubGeometryRef = useRef({ rows, rowHeight, rowPixelWidth, gutterWidth, onScrubStart, onScrubEnd });
  scrubGeometryRef.current = { rows, rowHeight, rowPixelWidth, gutterWidth, onScrubStart, onScrubEnd };
  const scrubRef = useRef({
    active: false,
    x: 0,
    y: 0,
    rowIndex: -1,
    offsetMs: 0,
    enteredCanvas: false,
    frame: null as number | null,
    lastFrameTs: 0,
    applyFrame: null as number | null,
  });
  useEffect(() => () => {
    const { frame, applyFrame } = scrubRef.current;
    if (frame != null) cancelAnimationFrame(frame);
    if (applyFrame != null) cancelAnimationFrame(applyFrame);
  }, []);
  const scrubGesture = useMemo(() => {
    const pointerRow = (y: number): number => {
      const { rows: allRows, rowHeight: stride } = scrubGeometryRef.current;
      const index = Math.floor(y / Math.max(1, stride));
      return Math.min(allRows.length - 1, Math.max(0, Number.isFinite(index) ? index : 0));
    };
    // Rows end at the screen edge on phones, so a finger cannot travel past a row's end. Holding in
    // the trailing edge zone (or over the leading gutter) keeps the scrub moving into the next (or
    // previous) row, the way text selection auto-scrolls.
    const edgeDirection = (x: number): -1 | 0 | 1 => {
      const scrub = scrubRef.current;
      const { gutterWidth: gutter, rowPixelWidth: width } = scrubGeometryRef.current;
      const canvasX = x - gutter;
      const direction = canvasX < 0 ? -1 : canvasX >= width - SCRUB_EDGE_ZONE_PX ? 1 : 0;
      if (direction === 0) scrub.enteredCanvas = true;
      // A scrub that starts at an edge must reach the canvas first, so it never auto-runs at once.
      return scrub.enteredCanvas ? direction : 0;
    };
    const pointerTime = (): number => {
      const { rows: allRows, rowPixelWidth: width, rowHeight: stride, gutterWidth: gutter } = scrubGeometryRef.current;
      const scrub = scrubRef.current;
      return scrubPointerToTimestamp(allRows, 0, width, stride, scrub.x - gutter, scrub.y);
    };
    const applyScrub = (): void => {
      const { rows: allRows } = scrubGeometryRef.current;
      if (allRows.length === 0) return;
      const songEnd = allRows[allRows.length - 1].endMs;
      const scrub = scrubRef.current;
      const base = pointerTime();
      scrub.offsetMs = Math.min(songEnd - base, Math.max(-base, scrub.offsetMs));
      const targetTime = Math.round(base + scrub.offsetMs);
      const { setCurrentTime, setGhostPlayheadTime } = useStudioStore.getState();
      setCurrentTime(targetTime);
      setGhostPlayheadTime(targetTime);
    };
    // Touch events can arrive faster than the display refreshes; publish at most one scrub
    // position per frame so each store update corresponds to a frame that can actually be shown.
    const scheduleApply = (): void => {
      const scrub = scrubRef.current;
      if (scrub.applyFrame != null) return;
      scrub.applyFrame = requestAnimationFrame(() => {
        scrub.applyFrame = null;
        if (scrub.active) applyScrub();
      });
    };
    const flushApply = (): void => {
      const scrub = scrubRef.current;
      if (scrub.applyFrame == null) return;
      cancelAnimationFrame(scrub.applyFrame);
      scrub.applyFrame = null;
      applyScrub();
    };
    const tick = (timestamp: number): void => {
      const scrub = scrubRef.current;
      scrub.frame = null;
      if (!scrub.active) return;
      const direction = edgeDirection(scrub.x);
      if (direction === 0) return;
      const elapsedMs = scrub.lastFrameTs > 0 ? Math.min(100, timestamp - scrub.lastFrameTs) : 16;
      scrub.lastFrameTs = timestamp;
      const row = scrubGeometryRef.current.rows[pointerRow(scrub.y)];
      if (!row) return;
      const rowSpanMs = Math.max(1, row.endMs - row.startMs);
      scrub.offsetMs += direction * rowSpanMs * (elapsedMs / SCRUB_EDGE_ROW_MS);
      applyScrub();
      scrub.frame = requestAnimationFrame(tick);
    };
    const updateScrub = (x: number, y: number): void => {
      const scrub = scrubRef.current;
      scrub.x = x;
      scrub.y = y;
      const rowIndex = pointerRow(y);
      // Moving between rows makes the finger authoritative again, so the playhead sits under it.
      if (rowIndex !== scrub.rowIndex) {
        scrub.rowIndex = rowIndex;
        scrub.offsetMs = 0;
      }
      scheduleApply();
      if (edgeDirection(x) !== 0 && scrub.frame == null) {
        scrub.lastFrameTs = 0;
        scrub.frame = requestAnimationFrame(tick);
      }
    };
    const resetScrub = (): void => {
      const scrub = scrubRef.current;
      if (scrub.frame != null) cancelAnimationFrame(scrub.frame);
      if (scrub.applyFrame != null) cancelAnimationFrame(scrub.applyFrame);
      Object.assign(scrub, {
        active: false,
        rowIndex: -1,
        offsetMs: 0,
        enteredCanvas: false,
        frame: null,
        lastFrameTs: 0,
        applyFrame: null,
      });
    };
    // Vertical-first movement fails before activation, so it stays a scroll; failOffsetY no longer
    // applies once horizontal movement has activated the scrub.
    return Gesture.Pan()
      .runOnJS(true)
      .activeOffsetX([-6, 6])
      .failOffsetY([-12, 12])
      .onStart(event => {
        resetScrub();
        scrubRef.current.active = true;
        scrubGeometryRef.current.onScrubStart();
        updateScrub(event.x, event.y);
        // The first position is shown immediately rather than on the next frame.
        flushApply();
      })
      .onUpdate(event => updateScrub(event.x, event.y))
      .onFinalize(() => {
        if (!scrubRef.current.active) return;
        // endWaveformScrub seeks the player to the stored time, so publish the final position first.
        flushApply();
        resetScrub();
        useStudioStore.getState().setGhostPlayheadTime(null);
        scrubGeometryRef.current.onScrubEnd();
      });
  }, []);

  const handleSelectMarker = useCallback((layerId: Layer['id'], timestamp: number) => {
    setSelectedMarker({ layerId, timestamp });
  }, [setSelectedMarker]);

  const renderRow = (row: WrappedRowModel) => (
    <WrappedRow
      key={row.index}
      row={row}
      rowPixelWidth={rowPixelWidth}
      rowHeight={rowHeight}
      gutterWidth={gutterWidth}
      isActiveRow={row.index === activeRowIndex}
      activeLayerColor={activeLayerColor}
      markersByLayer={markersByRow.get(row.index) ?? EMPTY_MARKERS}
      peaks={realPeaks}
      totalDuration={peakDuration}
      loopSegment={loopSegmentsByRow.get(row.index)}
      markerLoopSegment={markerLoopSegmentsByRow.get(row.index)}
      outsideLoopSegments={outsideLoopSegmentsByRow.get(row.index)}
      isLoopRangeEnabled={isLoopRangeEnabled}
      onSeek={onSeek}
      onSelectMarker={handleSelectMarker}
      onSelectForDetail={onSelectForDetail}
    />
  );

  if (!songLoaded || !audioUri || rows.length === 0) {
    return (
      <View
        style={[styles.placeholder, isMobile && styles.placeholderMobile]}
        testID="waveform-container"
      >
        <Text style={styles.placeholderText}>Load a song</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]} testID="waveform-container">
      {loading && <Text style={styles.loadingText}>Preparing waveform</Text>}
      {!isMobile && <View style={styles.followToolbar}>
        <RowDensityControls
          mode={effectiveRowDensity.mode}
          density={effectiveRowDensity}
          onChange={setRowDensity}
        />
        <Pressable
          accessibilityLabel="Follow playhead"
          accessibilityRole="switch"
          accessibilityState={{ checked: followPlayhead && !followSuspended }}
          onPress={handleFollowToggle}
          style={({ pressed }) => [
            styles.followToggle,
            followPlayhead && !followSuspended && styles.followToggleActive,
            pressed && styles.followTogglePressed,
          ]}
          testID="wrapped-follow-toggle"
        >
          <Text style={styles.followToggleText}>
            {followPlayhead ? (followSuspended ? 'Follow: Suspended' : 'Follow: On') : 'Follow: Off'}
          </Text>
        </Pressable>
      </View>}
      {isMobile ? (
        <GestureDetector gesture={scrubGesture}>
          <View
            style={[styles.viewport, styles.viewportMobile]}
            onLayout={handleLayout}
            testID="wrapped-waveform"
          >
            {rows.map(renderRow)}
          </View>
        </GestureDetector>
      ) : (
        <ScrollView
          ref={scrollRef}
          {...webManualScrollProps}
          style={[styles.viewport, { height: isLandscape ? 288 : 336 }]}
          contentContainerStyle={styles.scrollContent}
          nestedScrollEnabled
          onLayout={handleLayout}
          onScroll={handleScroll}
          onScrollBeginDrag={handleManualScrollStart}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
          testID="wrapped-waveform"
        >
          {/* Content coordinates include the spacers, so y / rowHeight is the absolute row. */}
          <GestureDetector gesture={scrubGesture}>
            <View>
              <View style={{ height: topSpacerHeight }} />
              {visibleRows.map(renderRow)}
              <View style={{ height: bottomSpacerHeight }} />
            </View>
          </GestureDetector>
        </ScrollView>
      )}
    </View>
  );
};

export default React.memo(WrappedWaveform);
