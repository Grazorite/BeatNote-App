import { useMemo } from 'react';
import { useStudioStore } from './useStudioStore';
import {
  computeFittedRows,
  computeRows,
  computeRowPixelWidth,
  computeVisibleRange,
  resolveBpmUsable,
  resolveOverscan,
  resolveRowDensity,
  resolveRowHeight,
  type VisibleRange,
  type WrappedRow,
} from '../utils/rowLayout';
import { timestampToRow } from '../utils/timelineMapping';

export interface WrappedViewportMetrics {
  scrollOffset: number;
  containerHeight: number;
  fittedRowCount?: number;
  rowHeight?: number;
  gutterWidth?: number;
  overscan?: number;
}

export interface UseWrappedRowsResult {
  rows: WrappedRow[];
  visibleRange: VisibleRange;
  rowPixelWidth: number;
  activeRowIndex: number;
  recomputeKey: string;
}

function toFiniteNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function useWrappedRows(
  availableWidth: number,
  isLandscape: boolean,
  viewport?: WrappedViewportMetrics,
): UseWrappedRowsResult {
  const songDuration = useStudioStore((s) => s.songDuration);
  const bpm = useStudioStore((s) => s.bpm);
  const countSize = useStudioStore((s) => s.countSize);
  const rowDensity = useStudioStore((s) => s.rowDensity);
  const currentTime = useStudioStore((s) => s.currentTime);

  const { rows, recomputeKey } = useMemo(() => {
    const duration = Math.max(0, Math.round(toFiniteNumber(songDuration)));
    const safeBpm = Math.max(0, toFiniteNumber(bpm));
    const fittedRowCount = viewport?.fittedRowCount;
    const density = resolveRowDensity(rowDensity, isLandscape);
    const bpmUsable = resolveBpmUsable(toFiniteNumber(bpm), density);
    const keyParts = [
      duration,
      safeBpm,
      countSize,
      density.mode,
      density.phrasesPerRow ?? 'default',
      density.rowDurationMs ?? 'default',
      Math.max(0, Math.floor(toFiniteNumber(availableWidth))),
      isLandscape ? 'landscape' : 'portrait',
      fittedRowCount ?? 'density',
    ];
    const recomputeKey = keyParts.join('|');
    const computedRows = fittedRowCount == null
      ? computeRows({
        songDuration: duration,
        bpm: safeBpm,
        countSize,
        density,
        bpmUsable,
      })
      : computeFittedRows(duration, fittedRowCount);
    return { rows: computedRows, recomputeKey };
  }, [
    songDuration,
    bpm,
    countSize,
    rowDensity,
    availableWidth,
    isLandscape,
    viewport?.fittedRowCount,
  ]);

  const rowPixelWidth = computeRowPixelWidth(availableWidth, isLandscape, viewport?.gutterWidth);
  const rowHeight = resolveRowHeight(isLandscape, viewport?.rowHeight);
  const overscan = resolveOverscan(viewport?.overscan);

  const visibleRange = computeVisibleRange(
    rows.length,
    viewport?.scrollOffset ?? 0,
    viewport?.containerHeight ?? rowHeight,
    rowHeight,
    overscan,
  );

  const activeRowIndex = timestampToRow(rows, toFiniteNumber(currentTime));

  return {
    rows,
    visibleRange,
    rowPixelWidth,
    activeRowIndex,
    recomputeKey,
  };
}
