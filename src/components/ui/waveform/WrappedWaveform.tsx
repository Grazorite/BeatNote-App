import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { Layer } from '../../../hooks/useStudioStore';
import { useStudioStore } from '../../../hooks/useStudioStore';
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
  timestampToRow,
  type RowLoopSegment,
} from '../../../utils/timelineMapping';
import { isValidLoopRange, outsideLoopSegmentsForRow } from '../../../utils/loopRange';
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
}

const MOBILE_TARGET_ROW_HEIGHT = 56;
const MOBILE_GUTTER_WIDTH = 52;
const EMPTY_MARKERS: WrappedLayerMarkers[] = [];

const WrappedWaveform: React.FC<WrappedWaveformProps> = ({
  audioUri,
  layers,
  onSeek,
  onScrubStart,
  onScrubEnd,
  onSelectForDetail,
  isMobile = false,
}) => {
  const window = useWindowDimensions();
  const isLandscape = window.width > window.height;
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
  const [availableWidth, setAvailableWidth] = useState(Math.max(1, window.width - 16));
  const [scrollOffset, setScrollOffset] = useState(0);
  const [containerHeight, setContainerHeight] = useState(isLandscape ? 288 : 336);
  const [followSuspended, setFollowSuspended] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const suspendedSawActiveOutside = useRef(false);
  const fittedRowCount = isMobile
    ? Math.max(1, Math.ceil(containerHeight / MOBILE_TARGET_ROW_HEIGHT))
    : undefined;
  const rowHeight = isMobile && fittedRowCount != null
    ? containerHeight / fittedRowCount
    : resolveRowHeight(isLandscape);
  const gutterWidth = resolveGutterWidth(isLandscape, isMobile ? MOBILE_GUTTER_WIDTH : undefined);
  const effectiveRowDensity = resolveRowDensity(rowDensity, isLandscape);
  const { waveformData, loading } = useWaveformData(audioUri || null);
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
    setAvailableWidth(current => Math.abs(current - width) > 1 ? width : current);
    setContainerHeight(current => Math.abs(current - height) > 1 ? height : current);
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
      outsideLoopSegments={outsideLoopSegmentsByRow.get(row.index)}
      isLoopRangeEnabled={isLoopRangeEnabled}
      onSeek={onSeek}
      onScrubStart={onScrubStart}
      onScrubEnd={onScrubEnd}
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
        <View
          style={[styles.viewport, styles.viewportMobile]}
          onLayout={handleLayout}
          testID="wrapped-waveform"
        >
          {rows.map(renderRow)}
        </View>
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
          <View style={{ height: topSpacerHeight }} />
          {visibleRows.map(renderRow)}
          <View style={{ height: bottomSpacerHeight }} />
        </ScrollView>
      )}
    </View>
  );
};

export default React.memo(WrappedWaveform);
