import * as fc from 'fast-check';
import type { WrappedRow } from '../../src/utils/rowLayout';
import {
  clipRowProgress,
  loopSegmentsForRows,
  pointerToTimestamp,
  timestampToRow,
} from '../../src/utils/timelineMapping';

const rows: WrappedRow[] = [
  { index: 0, startMs: 0, endMs: 4000 },
  { index: 1, startMs: 4000, endMs: 8000 },
  { index: 2, startMs: 8000, endMs: 10000 },
];

describe('timestampToRow', () => {
  it('assigns a boundary to the later row and the song endpoint to the final row', () => {
    expect(timestampToRow(rows, 0)).toBe(0);
    expect(timestampToRow(rows, 3999)).toBe(0);
    expect(timestampToRow(rows, 4000)).toBe(1);
    expect(timestampToRow(rows, 8000)).toBe(2);
    expect(timestampToRow(rows, 10000)).toBe(2);
  });

  it('rejects empty, non-finite, and out-of-range positions', () => {
    expect(timestampToRow([], 0)).toBe(-1);
    for (const time of [-1, 10001, NaN, Infinity]) {
      expect(timestampToRow(rows, time)).toBe(-1);
    }
  });

  it('has exactly one owner for every integer timestamp', () => {
    fc.assert(fc.property(fc.integer({ min: 1, max: 100000 }), fc.integer({ min: 0, max: 100000 }),
      (duration, sample) => {
        const cut = Math.floor(duration / 2);
        const partition = cut === 0
          ? [{ index: 0, startMs: 0, endMs: duration }]
          : [{ index: 0, startMs: 0, endMs: cut }, { index: 1, startMs: cut, endMs: duration }];
        const timestamp = sample % (duration + 1);
        const owner = timestampToRow(partition, timestamp);
        const owningRows = partition.filter((row, index) =>
          timestamp >= row.startMs && (timestamp < row.endMs || (index === partition.length - 1 && timestamp === duration)));
        expect(owningRows).toHaveLength(1);
        expect(owner).toBe(owningRows[0].index);
      }));
  });
});

describe('pointerToTimestamp', () => {
  it('clamps pointer coordinates to the row including its end', () => {
    const context = { row: rows[1], rowPixelWidth: 200 };
    expect(pointerToTimestamp(context, -5)).toBe(4000);
    expect(pointerToTimestamp(context, 100)).toBe(6000);
    expect(pointerToTimestamp(context, 250)).toBe(8000);
    expect(pointerToTimestamp(context, NaN)).toBe(4000);
  });

  it('round-trips integer timestamps through their x position within one millisecond', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 100000 }),
      fc.integer({ min: 0, max: 100000 }),
      fc.integer({ min: 1, max: 2000 }),
      (span, offset, width) => {
        const row = { index: 0, startMs: 125, endMs: 125 + span };
        const timestamp = row.startMs + (offset % (span + 1));
        const x = ((timestamp - row.startMs) / span) * width;
        expect(Math.abs(pointerToTimestamp({ row, rowPixelWidth: width }, x) - timestamp)).toBeLessThanOrEqual(1);
      },
    ));
  });
});

describe('clipRowProgress', () => {
  it('returns 0 before, 1 after, and a fraction inside the row', () => {
    expect(clipRowProgress(rows[1], 3000)).toBe(0);
    expect(clipRowProgress(rows[1], 4000)).toBe(0);
    expect(clipRowProgress(rows[1], 6000)).toBe(0.5);
    expect(clipRowProgress(rows[1], 8000)).toBe(1);
    expect(clipRowProgress(rows[1], 9000)).toBe(1);
  });

  it('is clipped and monotonic as playback advances', () => {
    fc.assert(fc.property(fc.integer({ min: -5000, max: 15000 }), fc.integer({ min: -5000, max: 15000 }),
      (a, b) => {
        const before = clipRowProgress(rows[1], Math.min(a, b));
        const after = clipRowProgress(rows[1], Math.max(a, b));
        expect(before).toBeGreaterThanOrEqual(0);
        expect(after).toBeLessThanOrEqual(1);
        expect(before).toBeLessThanOrEqual(after);
      }));
  });
});

describe('loopSegmentsForRows', () => {
  it('clips a loop to each row and skips empty or reversed ranges', () => {
    expect(loopSegmentsForRows(rows, 2000, 9000)).toEqual([
      { rowIndex: 0, fromMs: 2000, toMs: 4000 },
      { rowIndex: 1, fromMs: 4000, toMs: 8000 },
      { rowIndex: 2, fromMs: 8000, toMs: 9000 },
    ]);
    expect(loopSegmentsForRows(rows, 4000, 8000)).toEqual([
      { rowIndex: 1, fromMs: 4000, toMs: 8000 },
    ]);
    expect(loopSegmentsForRows(rows, 9000, 2000)).toEqual([]);
    expect(loopSegmentsForRows(rows, 5000, 5000)).toEqual([]);
  });

  it('covers the full loop exactly once', () => {
    fc.assert(fc.property(fc.integer({ min: 0, max: 10000 }), fc.integer({ min: 0, max: 10000 }),
      (a, b) => {
        const start = Math.min(a, b);
        const end = Math.max(a, b);
        const segments = loopSegmentsForRows(rows, start, end);
        expect(segments.reduce((length, segment) => length + segment.toMs - segment.fromMs, 0)).toBe(end - start);
        for (let index = 1; index < segments.length; index++) {
          expect(segments[index - 1].toMs).toBe(segments[index].fromMs);
        }
      }));
  });
});
