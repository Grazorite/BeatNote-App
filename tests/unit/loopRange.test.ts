import * as fc from 'fast-check';

import {
  FALLBACK_KEY_STEP_MS,
  LOOP_BOUNDARY_TOLERANCE_MS,
  MIN_LOOP_DURATION_MS,
  beatStepMs,
  decideLoopWrap,
  formatLoopTime,
  isValidLoopRange,
  loopSummaryLabel,
  moveLoopRange,
  msToOverviewX,
  normalizeLoopRange,
  outsideLoopSegmentsForRow,
  overviewXToMs,
  reclampLoopRangeToDuration,
  resizeLoopBound,
  resolveGestureMode,
  resolveHandleHit,
} from '../../src/utils/loopRange';
import { compareProjectVersion } from '../../src/utils/projectManager';

describe('loop range examples', () => {
  it('normalizes ordering, rounding, bounds, and invalid inputs', () => {
    expect(normalizeLoopRange(4000.4, 1000.5, 5000)).toEqual({ loopStartMs: 1001, loopEndMs: 4000 });
    expect(normalizeLoopRange(-200, 800, 5000)).toEqual({ loopStartMs: 0, loopEndMs: 800 });
    expect(normalizeLoopRange(4900, 8000, 5000)).toEqual({ loopStartMs: null, loopEndMs: null });
    expect(normalizeLoopRange(null, 1000, 5000)).toEqual({ loopStartMs: null, loopEndMs: null });
    expect(normalizeLoopRange(Number.NaN, 1000, 5000)).toEqual({ loopStartMs: null, loopEndMs: null });
    expect(normalizeLoopRange(1000, 2000, 0)).toEqual({ loopStartMs: 1000, loopEndMs: 2000 });
  });

  it('reclamps ranges to measured duration or clears them', () => {
    expect(reclampLoopRangeToDuration({ loopStartMs: 1000, loopEndMs: 180000 }, 179987.4)).toEqual({
      loopStartMs: 1000,
      loopEndMs: 179987,
    });
    expect(reclampLoopRangeToDuration({ loopStartMs: 179700, loopEndMs: 180000 }, 179987)).toEqual({
      loopStartMs: null,
      loopEndMs: null,
    });
  });

  it('moves ranges without changing their duration and clamps both edges', () => {
    const range = { loopStartMs: 1000, loopEndMs: 3000 };
    expect(moveLoopRange(range, 0, 10000)).toEqual(range);
    expect(moveLoopRange(range, -5000, 10000)).toEqual({ loopStartMs: 0, loopEndMs: 2000 });
    expect(moveLoopRange(range, 20000, 10000)).toEqual({ loopStartMs: 8000, loopEndMs: 10000 });
  });

  it('resizes each bound while preserving the minimum gap and opposite bound', () => {
    const range = { loopStartMs: 1000, loopEndMs: 3000 };
    expect(resizeLoopBound(range, 'start', 2900, 10000)).toEqual({ loopStartMs: 2500, loopEndMs: 3000 });
    expect(resizeLoopBound(range, 'end', 1100, 10000)).toEqual({ loopStartMs: 1000, loopEndMs: 1500 });
  });

  it('uses a BPM-derived keyboard step or the fallback', () => {
    expect(beatStepMs(120)).toBe(500);
    expect(beatStepMs(0)).toBe(FALLBACK_KEY_STEP_MS);
    expect(beatStepMs(Number.NaN)).toBe(FALLBACK_KEY_STEP_MS);
  });

  it('maps overview positions and returns zero for degenerate dimensions', () => {
    expect(msToOverviewX(5000, 10000, 200)).toBe(100);
    expect(overviewXToMs(100, 10000, 200)).toBe(5000);
    expect(msToOverviewX(1, 0, 100)).toBe(0);
    expect(overviewXToMs(1, 100, Number.NaN)).toBe(0);
  });

  it('resolves overlapping handles by distance and activating direction', () => {
    const range = { loopStartMs: 1000, loopEndMs: 1500 };
    expect(resolveHandleHit(12, range, 10000, 100, 'web')).toBe('start');
    expect(resolveHandleHit(12.5, range, 10000, 100, 'web', -1)).toBe('start');
    expect(resolveHandleHit(12.5, range, 10000, 100, 'web', 1)).toBe('end');
    expect(resolveGestureMode(12.5, range, 10000, 100, 'web', 1)).toBe('resize-end');
    expect(resolveGestureMode(50, range, 10000, 100, 'web')).toBe('create');
  });

  it('returns outside sub-segments using half-open row boundaries', () => {
    const range = { loopStartMs: 2000, loopEndMs: 8000 };
    expect(outsideLoopSegmentsForRow(0, 4000, range)).toEqual([{ fromMs: 0, toMs: 2000 }]);
    expect(outsideLoopSegmentsForRow(4000, 8000, range)).toEqual([]);
    expect(outsideLoopSegmentsForRow(8000, 10000, range)).toEqual([{ fromMs: 8000, toMs: 10000 }]);
    expect(outsideLoopSegmentsForRow(0, 1000, { loopStartMs: null, loopEndMs: null })).toEqual([]);
  });

  it('formats loop timestamps and summaries', () => {
    expect(formatLoopTime(61250)).toBe('1:01.2');
    expect(loopSummaryLabel({ loopStartMs: 61250, loopEndMs: 63250 })).toBe('Loop 1:01.2 to 1:03.2, 2.0 seconds');
    expect(loopSummaryLabel({ loopStartMs: null, loopEndMs: null })).toBe('No loop selected');
  });
});

describe('loop wrap examples', () => {
  const base = {
    isEnabled: true,
    isPlaying: true,
    loopStartMs: 1000,
    loopEndMs: 3000,
    previousSampleMs: 2500,
    currentSampleMs: 2969,
    toleranceMs: LOOP_BOUNDARY_TOLERANCE_MS,
  };

  it.each([
    ['before threshold', {}, 'noWrap'],
    ['at threshold', { currentSampleMs: 2970 }, 'wrap'],
    ['at loop end', { currentSampleMs: 3000 }, 'wrap'],
    ['beyond loop end', { currentSampleMs: 10000 }, 'wrap'],
    ['previous at loop end', { previousSampleMs: 3000, currentSampleMs: 3100 }, 'noWrap'],
    ['previous before loop start', { previousSampleMs: 999, currentSampleMs: 3000 }, 'noWrap'],
    ['disabled', { isEnabled: false, currentSampleMs: 3000 }, 'noWrap'],
    ['paused', { isPlaying: false, currentSampleMs: 3000 }, 'noWrap'],
    ['null range', { loopStartMs: null, loopEndMs: null, currentSampleMs: 3000 }, 'noWrap'],
  ])('%s produces %s', (_name, changes, expectedKind) => {
    expect(decideLoopWrap({ ...base, ...changes }).kind).toBe(expectedKind);
  });
});

describe('Feature: loop-range-overview correctness properties', () => {
  it('Property 1: normalization is idempotent and well-shaped', () => {
    fc.assert(fc.property(
      fc.oneof(fc.integer({ min: -100000, max: 200000 }), fc.constant(Number.NaN), fc.constant(Infinity)),
      fc.oneof(fc.integer({ min: -100000, max: 200000 }), fc.constant(Number.NaN), fc.constant(-Infinity)),
      fc.integer({ min: 0, max: 100000 }),
      (a, b, duration) => {
        const first = normalizeLoopRange(a, b, duration);
        const second = normalizeLoopRange(first.loopStartMs, first.loopEndMs, duration);
        expect(second).toEqual(first);
        if (first.loopStartMs !== null && first.loopEndMs !== null) {
          expect(Number.isInteger(first.loopStartMs)).toBe(true);
          expect(Number.isInteger(first.loopEndMs)).toBe(true);
          expect(first.loopStartMs).toBeGreaterThanOrEqual(0);
          expect(first.loopEndMs - first.loopStartMs).toBeGreaterThanOrEqual(MIN_LOOP_DURATION_MS);
          if (duration > 0) expect(first.loopEndMs).toBeLessThanOrEqual(duration);
        }
      },
    ), { numRuns: 100 });
  });

  it('Property 2: move preserves duration', () => {
    fc.assert(fc.property(
      fc.integer({ min: 500, max: 100000 }),
      fc.integer({ min: 0, max: 100000 }),
      fc.integer({ min: -200000, max: 200000 }),
      (length, offset, delta) => {
        const songDuration = length + 100000;
        const start = offset % (songDuration - length + 1);
        const range = { loopStartMs: start, loopEndMs: start + length };
        const moved = moveLoopRange(range, delta, songDuration);
        expect(isValidLoopRange(moved, songDuration)).toBe(true);
        expect((moved.loopEndMs as number) - (moved.loopStartMs as number)).toBe(length);
        if (delta === 0) expect(moved).toEqual(range);
      },
    ), { numRuns: 100 });
  });

  it('Property 3: resize preserves the other bound and minimum duration', () => {
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 50000 }),
      fc.integer({ min: 500, max: 50000 }),
      fc.integer({ min: -100000, max: 200000 }),
      fc.constantFrom<'start' | 'end'>('start', 'end'),
      (start, length, candidate, bound) => {
        const songDuration = start + length + 50000;
        const range = { loopStartMs: start, loopEndMs: start + length };
        const resized = resizeLoopBound(range, bound, candidate, songDuration);
        expect(isValidLoopRange(resized, songDuration)).toBe(true);
        expect((resized.loopEndMs as number) - (resized.loopStartMs as number)).toBeGreaterThanOrEqual(MIN_LOOP_DURATION_MS);
        if (bound === 'start') expect(resized.loopEndMs).toBe(range.loopEndMs);
        else expect(resized.loopStartMs).toBe(range.loopStartMs);
      },
    ), { numRuns: 100 });
  });

  it('Property 4: pixel mapping is monotonic, integral, and round-trip bounded', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 500000 }),
      fc.integer({ min: 1, max: 2000 }),
      fc.integer({ min: 0, max: 500000 }),
      (duration, width, sample) => {
        const timestamp = sample % (duration + 1);
        const x = msToOverviewX(timestamp, duration, width);
        const roundTrip = overviewXToMs(x, duration, width);
        expect(Number.isInteger(roundTrip)).toBe(true);
        expect(roundTrip).toBeGreaterThanOrEqual(0);
        expect(roundTrip).toBeLessThanOrEqual(duration);
        expect(Math.abs(roundTrip - timestamp)).toBeLessThanOrEqual(Math.ceil(duration / width));
        expect(overviewXToMs(Math.min(width, x + 1), duration, width)).toBeGreaterThanOrEqual(roundTrip);
      },
    ), { numRuns: 100 });
  });

  it('Property 5: wrap fires exactly when armed', () => {
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 100000 }),
      fc.integer({ min: 500, max: 100000 }),
      fc.integer({ min: -100000, max: 300000 }),
      fc.integer({ min: -100000, max: 300000 }),
      (start, length, previous, current) => {
        const end = start + length;
        const decision = decideLoopWrap({
          isEnabled: true,
          isPlaying: true,
          loopStartMs: start,
          loopEndMs: end,
          previousSampleMs: previous,
          currentSampleMs: current,
          toleranceMs: LOOP_BOUNDARY_TOLERANCE_MS,
        });
        const shouldWrap = previous >= start && previous < end && current >= end - LOOP_BOUNDARY_TOLERANCE_MS;
        expect(decision.kind === 'wrap').toBe(shouldWrap);
        if (decision.kind === 'wrap') expect(decision.targetMs).toBe(start);
      },
    ), { numRuns: 100 });
  });

  it('Property 6: duration reclamp is valid or null', () => {
    fc.assert(fc.property(
      fc.option(fc.integer({ min: -100000, max: 200000 }), { nil: null }),
      fc.option(fc.integer({ min: -100000, max: 200000 }), { nil: null }),
      fc.integer({ min: 1, max: 100000 }),
      (start, end, duration) => {
        const result = reclampLoopRangeToDuration({ loopStartMs: start, loopEndMs: end }, duration);
        expect(result.loopStartMs === null && result.loopEndMs === null || isValidLoopRange(result, duration)).toBe(true);
      },
    ), { numRuns: 100 });
  });

  it('Property 9: version comparison is numeric and a total order', () => {
    const versionArb = fc.tuple(
      fc.integer({ min: 0, max: 1000 }),
      fc.integer({ min: 0, max: 1000 }),
      fc.integer({ min: 0, max: 1000 }),
    );
    fc.assert(fc.property(versionArb, versionArb, versionArb, (a, b, c) => {
      const text = (value: [number, number, number]): string => value.join('.');
      const ab = compareProjectVersion(text(a), text(b));
      const ba = compareProjectVersion(text(b), text(a));
      expect(ab).toBe(-ba);
      if (ab <= 0 && compareProjectVersion(text(b), text(c)) <= 0) {
        expect(compareProjectVersion(text(a), text(c))).toBeLessThanOrEqual(0);
      }
    }), { numRuns: 100 });
    expect(compareProjectVersion('1.10.0', '1.2.0')).toBe(1);
  });
});
