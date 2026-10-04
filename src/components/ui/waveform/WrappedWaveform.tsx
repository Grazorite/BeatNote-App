import React, { useCallback, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
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
  resolveRowHeight,
  type WrappedRow as WrappedRowModel,
} from '../../../utils/rowLayout';
import { clipRowProgress, timestampToRow } from '../../../utils/timelineMapping';
import WrappedRow, { type WrappedLayerMarkers } from './WrappedRow';
import { wrappedWaveformStyles as styles } from '../../../styles/components/waveform/wrappedWaveform';
import { colors } from '../../../styles/common';

interface WrappedWaveformProps {
  audioUri?: string;
  layers: Layer[];
  onSeek: (positionMs: number) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
}

const WrappedWaveform: React.FC<WrappedWaveformProps> = ({
  audioUri,
  layers,
  onSeek,
  onScrubStart,
  onScrubEnd,
}) => {
  const window = useWindowDimensions();
  const isLandscape = window.width > window.height;
  const currentTime = useStudioStore(state => state.currentTime);
  const songDuration = useStudioStore(state => state.songDuration);
  const songLoaded = useStudioStore(state => state.songLoaded);
  const activeLayerId = useStudioStore(state => state.activeLayerId);
  const addMarker = useStudioStore(state => state.addMarker);
  const setSelectedMarker = useStudioStore(state => state.setSelectedMarker);
  const [availableWidth, setAvailableWidth] = useState(Math.max(1, window.width - 16));
  const [scrollOffset, setScrollOffset] = useState(0);
  const [containerHeight, setContainerHeight] = useState(isLandscape ? 288 : 336);
  const rowHeight = resolveRowHeight(isLandscape);
  const gutterWidth = resolveGutterWidth(isLandscape);
  const { waveformData, loading } = useWaveformData(audioUri || null);
  const { rows, visibleRange, rowPixelWidth, activeRowIndex } = useWrappedRows(
    availableWidth,
    isLandscape,
    { scrollOffset, containerHeight, rowHeight, gutterWidth },
  );

  const visibleRows = useMemo(
    () => visibleRange.lastIndex >= visibleRange.firstIndex
      ? rows.slice(visibleRange.firstIndex, visibleRange.lastIndex + 1)
      : [],
    [rows, visibleRange.firstIndex, visibleRange.lastIndex],
  );
  const topSpacerHeight = visibleRange.firstIndex * rowHeight;
  const bottomSpacerHeight = Math.max(0, rows.length - visibleRange.lastIndex - 1) * rowHeight;
  const activeLayerColor = layers.find(layer => layer.id === activeLayerId)?.color || colors.accent;
  const realPeaks = waveformData?.source === 'decoded' ? waveformData.peaks : undefined;
  const peakDuration = waveformData?.source === 'decoded' ? waveformData.duration : songDuration;

  const markersForRow = useCallback((row: WrappedRowModel): WrappedLayerMarkers[] => (
    layers
      .filter(layer => layer.isVisible)
      .map(layer => ({
        layerId: layer.id,
        color: layer.color,
        timestamps: layer.markers.filter(timestamp => timestampToRow(rows, timestamp) === row.index),
      }))
      .filter(layer => layer.timestamps.length > 0)
  ), [layers, rows]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setAvailableWidth(current => Math.abs(current - width) > 1 ? width : current);
    setContainerHeight(current => Math.abs(current - height) > 1 ? height : current);
  }, []);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollOffset(Math.max(0, event.nativeEvent.contentOffset.y));
  }, []);

  const handlePlaceMarker = useCallback((timestamp: number) => {
    addMarker(timestamp);
    setSelectedMarker({ layerId: activeLayerId, timestamp });
  }, [activeLayerId, addMarker, setSelectedMarker]);

  const handleSelectMarker = useCallback((layerId: Layer['id'], timestamp: number) => {
    setSelectedMarker({ layerId, timestamp });
  }, [setSelectedMarker]);

  if (!songLoaded || !audioUri || rows.length === 0) {
    return (
      <View style={styles.placeholder} testID="waveform-container">
        <Text style={styles.placeholderText}>Load a song to view the wrapped timeline</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="waveform-container">
      {loading && <Text style={styles.loadingText}>Preparing waveform</Text>}
      <ScrollView
        style={[styles.viewport, { height: isLandscape ? 288 : 336 }]}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        onLayout={handleLayout}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator
        testID="wrapped-waveform"
      >
        <View style={{ height: topSpacerHeight }} />
        {visibleRows.map(row => (
          <WrappedRow
            key={row.index}
            row={row}
            rowPixelWidth={rowPixelWidth}
            rowHeight={rowHeight}
            gutterWidth={gutterWidth}
            isActiveRow={row.index === activeRowIndex}
            progress={clipRowProgress(row, currentTime)}
            activeLayerColor={activeLayerColor}
            markersByLayer={markersForRow(row)}
            peaks={realPeaks}
            totalDuration={peakDuration}
            onSeek={onSeek}
            onScrubStart={onScrubStart}
            onScrubEnd={onScrubEnd}
            onPlaceMarker={handlePlaceMarker}
            onSelectMarker={handleSelectMarker}
          />
        ))}
        <View style={{ height: bottomSpacerHeight }} />
      </ScrollView>
    </View>
  );
};

export default React.memo(WrappedWaveform);
