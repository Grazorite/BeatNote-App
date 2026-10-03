import type { WrappedRow } from './rowLayout';

export interface RowRenderContext {
  row: WrappedRow;
  rowPixelWidth: number;
}

export interface RowLoopSegment {
  rowIndex: number;
  fromMs: number;
  toMs: number;
}

// Rows are half-open except that the song endpoint belongs to the final row.
export function timestampToRow(rows: readonly WrappedRow[], timestamp: number): number {
  if (rows.length === 0 || !Number.isFinite(timestamp)) return -1;
  const last = rows[rows.length - 1];
  if (timestamp < rows[0].startMs || timestamp > last.endMs) return -1;
  if (timestamp === last.endMs) return last.index;

  let left = 0;
  let right = rows.length - 1;
  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const row = rows[middle];
    if (timestamp < row.startMs) {
      right = middle - 1;
    } else if (timestamp >= row.endMs) {
      left = middle + 1;
    } else {
      return row.index;
    }
  }
  return -1;
}

export function pointerToTimestamp({ row, rowPixelWidth }: RowRenderContext, xPx: number): number {
  const width = Number.isFinite(rowPixelWidth) ? Math.max(1, rowPixelWidth) : 1;
  const x = Number.isFinite(xPx) ? Math.min(width, Math.max(0, xPx)) : 0;
  const span = Math.max(0, row.endMs - row.startMs);
  return Math.round(Math.min(row.endMs, Math.max(row.startMs, row.startMs + (x / width) * span)));
}

export function clipRowProgress(row: WrappedRow, currentTime: number): number {
  if (!Number.isFinite(currentTime) || currentTime <= row.startMs) return 0;
  if (currentTime >= row.endMs) return 1;
  return (currentTime - row.startMs) / (row.endMs - row.startMs);
}

export function loopSegmentsForRows(
  rows: readonly WrappedRow[],
  loopStartMs: number,
  loopEndMs: number,
): RowLoopSegment[] {
  if (!Number.isFinite(loopStartMs) || !Number.isFinite(loopEndMs) || loopStartMs >= loopEndMs) {
    return [];
  }

  const segments: RowLoopSegment[] = [];
  for (const row of rows) {
    const fromMs = Math.max(loopStartMs, row.startMs);
    const toMs = Math.min(loopEndMs, row.endMs);
    if (fromMs < toMs) segments.push({ rowIndex: row.index, fromMs, toMs });
  }
  return segments;
}
