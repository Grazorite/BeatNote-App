import * as fc from 'fast-check';
import {
  computeFittedRows,
  computeRowPixelWidth,
  computeRows,
  computeVisibleRange,
  phraseRowDurationMs,
  resolveGutterWidth,
  resolveRowDensity,
  RowLayoutConfig,
} from '../../src/utils/rowLayout';

const base: RowLayoutConfig = {
  songDuration: 15000,
  bpm: 120,
  countSize: 8,
  density: { mode: 'phrase', phrasesPerRow: 1 },
  bpmUsable: true,
};

describe('row layout', () => {
  it('fits the whole song into an exact static row budget', () => {
    expect(computeFittedRows(150000, 6)).toEqual([
      { index: 0, startMs: 0, endMs: 25000 },
      { index: 1, startMs: 25000, endMs: 50000 },
      { index: 2, startMs: 50000, endMs: 75000 },
      { index: 3, startMs: 75000, endMs: 100000 },
      { index: 4, startMs: 100000, endMs: 125000 },
      { index: 5, startMs: 125000, endMs: 150000 },
    ]);
  });

  it('partitions arbitrary durations contiguously within the fitted row budget', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 7_200_000 }),
      fc.integer({ min: 1, max: 20 }),
      (songDuration, rowBudget) => {
        const rows = computeFittedRows(songDuration, rowBudget);
        expect(rows.length).toBeLessThanOrEqual(rowBudget);
        expect(rows[0].startMs).toBe(0);
        expect(rows.at(-1)?.endMs).toBe(songDuration);
        rows.forEach((row, index) => {
          expect(row.index).toBe(index);
          expect(row.endMs).toBeGreaterThan(row.startMs);
          if (index > 0) expect(row.startMs).toBe(rows[index - 1].endMs);
        });
      },
    ));
  });

  it('computes phrase durations for 4, 6, and 8 counts', () => {
    expect(phraseRowDurationMs(120, 4, 1)).toBe(2000);
    expect(phraseRowDurationMs(120, 6, 1)).toBe(3000);
    expect(phraseRowDurationMs(120, 8, 2)).toBe(8000);
  });

  it('creates contiguous, phrase-labelled rows with a short final row', () => {
    expect(computeRows(base)).toEqual([
      { index: 0, startMs: 0, endMs: 4000, phraseNumber: 1, countLabel: '1' },
      { index: 1, startMs: 4000, endMs: 8000, phraseNumber: 2, countLabel: '9' },
      { index: 2, startMs: 8000, endMs: 12000, phraseNumber: 3, countLabel: '17' },
      { index: 3, startMs: 12000, endMs: 15000, phraseNumber: 4, countLabel: '25' },
    ]);
    expect(computeRows({ ...base, density: { mode: 'phrase', phrasesPerRow: 2 } })[1])
      .toMatchObject({ startMs: 8000, phraseNumber: 3, countLabel: '17' });
  });

  it('uses integer boundaries for fractional phrase lengths', () => {
    const rows = computeRows({ ...base, bpm: 123, songDuration: 30000 });
    expect(rows.at(-1)?.endMs).toBe(30000);
    expect(rows[1]).toMatchObject({ startMs: 3902, phraseNumber: 2, countLabel: '9' });
    rows.forEach((row, index) => {
      expect(Number.isInteger(row.startMs)).toBe(true);
      expect(Number.isInteger(row.endMs)).toBe(true);
      expect(row.endMs).toBeGreaterThan(row.startMs);
      if (index > 0) expect(row.startMs).toBe(rows[index - 1].endMs);
    });
  });

  it('uses fixed duration for invalid BPM and clamps a too-small duration', () => {
    const rows = computeRows({ ...base, bpm: NaN, density: { mode: 'duration', rowDurationMs: 100 }, bpmUsable: false });
    expect(rows[0]).toEqual({ index: 0, startMs: 0, endMs: 2000 });
    expect(rows[1]).toEqual({ index: 1, startMs: 2000, endMs: 4000 });
    expect(rows[0].phraseNumber).toBeUndefined();
    expect(computeRows({ ...base, bpm: 0, density: { mode: 'phrase' } })[0].endMs).toBe(5000);
  });

  it('clamps phrases per row and handles unknown or very short duration', () => {
    expect(computeRows({ ...base, density: { mode: 'phrase', phrasesPerRow: 0 } }))
      .toEqual(computeRows(base));
    expect(computeRows({ ...base, songDuration: 0 })).toEqual([]);
    expect(computeRows({ ...base, songDuration: NaN })).toEqual([]);
    expect(computeRows({ ...base, songDuration: 1 })).toEqual([
      { index: 0, startMs: 0, endMs: 1, phraseNumber: 1, countLabel: '1' },
    ]);
  });

  it('partitions arbitrary integer durations deterministically', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 600000 }),
      fc.integer({ min: 20, max: 300 }),
      fc.constantFrom<4 | 6 | 8>(4, 6, 8),
      fc.integer({ min: 1, max: 4 }),
      (songDuration, bpm, countSize, phrasesPerRow) => {
        const config: RowLayoutConfig = {
          songDuration, bpm, countSize, bpmUsable: true,
          density: { mode: 'phrase', phrasesPerRow },
        };
        const rows = computeRows(config);
        expect(rows).toEqual(computeRows(config));
        expect(rows[0].startMs).toBe(0);
        expect(rows.at(-1)?.endMs).toBe(songDuration);
        rows.forEach((row, index) => {
          expect(row.index).toBe(index);
          expect(row.endMs).toBeGreaterThan(row.startMs);
          if (index > 0) expect(row.startMs).toBe(rows[index - 1].endMs);
        });
      },
    ));
  });
});

describe('wrapped row viewport helpers', () => {
  it('computes a bounded visible range with overscan from row-height geometry', () => {
    expect(computeVisibleRange(100, 250, 300, 100, 3)).toEqual({
      firstIndex: 0,
      lastIndex: 8,
    });
    expect(computeVisibleRange(100, 5000, 200, 100, 1)).toEqual({
      firstIndex: 49,
      lastIndex: 52,
    });
  });

  it('handles empty rows and invalid viewport metrics safely', () => {
    expect(computeVisibleRange(0, 0, 500, 100, 3)).toEqual({ firstIndex: 0, lastIndex: -1 });
    expect(computeVisibleRange(3, Number.NaN, -1, 0, -2)).toEqual({
      firstIndex: 0,
      lastIndex: 0,
    });
  });

  it('resolves orientation density defaults without mutating the stored preference', () => {
    const phraseDensity = { mode: 'phrase' } as const;
    expect(resolveRowDensity(phraseDensity, false)).toEqual({ mode: 'phrase', phrasesPerRow: 1 });
    expect(resolveRowDensity(phraseDensity, true)).toEqual({ mode: 'phrase', phrasesPerRow: 2 });
    expect(phraseDensity).toEqual({ mode: 'phrase' });

    expect(resolveRowDensity({ mode: 'duration' }, false)).toEqual({
      mode: 'duration',
      rowDurationMs: 5000,
    });
    expect(resolveRowDensity({ mode: 'duration' }, true)).toEqual({
      mode: 'duration',
      rowDurationMs: 10000,
    });
  });

  it('subtracts the orientation gutter and clamps drawable width', () => {
    expect(computeRowPixelWidth(400, false)).toBe(320);
    expect(computeRowPixelWidth(800, true)).toBe(704);
    expect(computeRowPixelWidth(40, false)).toBe(0);
    expect(resolveGutterWidth(false)).toBe(80);
    expect(resolveGutterWidth(true)).toBe(96);
    expect(resolveGutterWidth(true, 72.9)).toBe(72);
  });
});
