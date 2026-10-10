export interface WrappedRow {
  index: number;
  startMs: number;
  endMs: number;
  phraseNumber?: number;
  countLabel?: string;
}

export type RowDensityMode = 'phrase' | 'duration';

export interface RowDensity {
  mode: RowDensityMode;
  phrasesPerRow?: number;
  rowDurationMs?: number;
}

export interface RowLayoutConfig {
  songDuration: number;
  bpm: number;
  countSize: 4 | 6 | 8;
  density: RowDensity;
  bpmUsable: boolean;
}

export function phraseRowDurationMs(
  bpm: number,
  countSize: 4 | 6 | 8,
  phrasesPerRow: number,
): number {
  return (60000 / bpm) * countSize * phrasesPerRow;
}

export function computeRows(config: RowLayoutConfig): WrappedRow[] {
  if (!Number.isFinite(config.songDuration) || config.songDuration <= 0) return [];

  const duration = Math.round(config.songDuration);
  if (duration <= 0) return [];

  const phraseAware = config.bpmUsable && config.density.mode === 'phrase'
    && Number.isFinite(config.bpm) && config.bpm > 0;
  const requestedPhrases = config.density.phrasesPerRow;
  const phrasesPerRow = requestedPhrases != null && Number.isFinite(requestedPhrases)
    ? Math.max(1, Math.round(requestedPhrases))
    : 1;
  const requestedDuration = config.density.rowDurationMs;
  const fallbackDuration = requestedDuration != null && Number.isFinite(requestedDuration)
    ? Math.max(2000, requestedDuration)
    : 5000;
  const rowDurationMs = phraseAware
    ? Math.max(1, phraseRowDurationMs(config.bpm, config.countSize, phrasesPerRow))
    : fallbackDuration;

  const rows: WrappedRow[] = [];
  let startMs = 0;
  while (startMs < duration) {
    // Snap the ideal boundary once, then reuse it so adjacent rows never diverge.
    const idealEnd = Math.round((rows.length + 1) * rowDurationMs);
    const endMs = Math.min(duration, Math.max(startMs + 1, idealEnd));
    const row: WrappedRow = { index: rows.length, startMs, endMs };
    if (phraseAware) {
      row.phraseNumber = row.index * phrasesPerRow + 1;
      row.countLabel = String((row.phraseNumber - 1) * config.countSize + 1);
    }
    rows.push(row);
    startMs = endMs;
  }
  return rows;
}

export function computeFittedRows(songDuration: number, requestedRowCount: number): WrappedRow[] {
  if (!Number.isFinite(songDuration) || songDuration <= 0) return [];

  const duration = Math.round(songDuration);
  if (duration <= 0) return [];

  const safeRequestedCount = Number.isFinite(requestedRowCount)
    ? Math.max(1, Math.floor(requestedRowCount))
    : 1;
  const rowCount = Math.min(duration, safeRequestedCount);

  return Array.from({ length: rowCount }, (_, index) => ({
    index,
    startMs: Math.round((index * duration) / rowCount),
    endMs: Math.round(((index + 1) * duration) / rowCount),
  }));
}

export interface VisibleRange {
  firstIndex: number;
  lastIndex: number;
}

export function finiteNonNegative(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}

export function computeVisibleRange(
  rowCount: number,
  scrollOffset: number,
  containerHeight: number,
  rowHeight: number,
  overscan: number,
): VisibleRange {
  const count = Number.isFinite(rowCount) ? Math.max(0, Math.floor(rowCount)) : 0;
  if (count === 0) return { firstIndex: 0, lastIndex: -1 };

  const offset = finiteNonNegative(scrollOffset);
  const viewportHeight = finiteNonNegative(containerHeight);
  const safeRowHeight = Math.max(1, finiteNonNegative(rowHeight));
  const extra = Math.floor(finiteNonNegative(overscan));
  const firstVisible = Math.min(count - 1, Math.floor(offset / safeRowHeight));
  const lastVisible = viewportHeight > 0
    ? Math.min(count - 1, Math.max(firstVisible, Math.ceil((offset + viewportHeight) / safeRowHeight) - 1))
    : firstVisible;

  return {
    firstIndex: Math.max(0, firstVisible - extra),
    lastIndex: Math.min(count - 1, lastVisible + extra),
  };
}

export function resolveRowDensity(density: RowDensity, isLandscape: boolean): RowDensity {
  if (density.mode === 'phrase') {
    return { ...density, phrasesPerRow: density.phrasesPerRow ?? (isLandscape ? 2 : 1) };
  }
  return { ...density, rowDurationMs: density.rowDurationMs ?? (isLandscape ? 10000 : 5000) };
}

export function resolveBpmUsable(bpm: number, density: RowDensity): boolean {
  return density.mode === 'phrase'
    && typeof bpm === 'number'
    && Number.isFinite(bpm)
    && bpm > 0;
}

export function computeRowPixelWidth(
  availableWidth: number,
  isLandscape: boolean,
  gutterWidth?: number,
): number {
  const width = finiteNonNegative(availableWidth);
  const gutter = resolveGutterWidth(isLandscape, gutterWidth);
  return Math.max(0, Math.floor(width - gutter));
}

export function resolveGutterWidth(isLandscape: boolean, gutterWidth?: number): number {
  if (gutterWidth != null) return Math.floor(finiteNonNegative(gutterWidth));
  return isLandscape ? 96 : 80;
}

export function resolveRowHeight(isLandscape: boolean, rowHeight?: number): number {
  if (rowHeight != null) return Math.max(1, Math.floor(finiteNonNegative(rowHeight)));
  return isLandscape ? 96 : 112;
}

export function resolveOverscan(overscan?: number): number {
  if (overscan != null) {
    const value = finiteNonNegative(overscan);
    return Math.max(0, Math.floor(value));
  }
  return 3;
}
