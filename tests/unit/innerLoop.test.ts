import fc from 'fast-check';
import { MIN_LOOP_DURATION_MS } from '../../src/utils/loopRange';
import { canEnterRangeState, deriveInnerLoopState, formatSpeedLabel, nextInnerLoopState } from '../../src/utils/innerLoop';

describe('inner loop derivations', () => {
  it.each([
    [false, false, 'off'],
    [true, false, 'markers'],
    [false, true, 'range'],
    [true, true, 'range'],
  ] as const)('derives marker=%s range=%s as %s', (marker, range, expected) => {
    expect(deriveInnerLoopState(marker, range)).toBe(expected);
  });

  it('cycles off to markers to range to off', () => {
    expect(nextInnerLoopState('off')).toBe('markers');
    expect(nextInnerLoopState('markers')).toBe('range');
    expect(nextInnerLoopState('range')).toBe('off');
  });

  it('guards range entry at the minimum duration unless a valid range exists', () => {
    expect(canEnterRangeState(0, false)).toBe(false);
    expect(canEnterRangeState(MIN_LOOP_DURATION_MS - 1, false)).toBe(false);
    expect(canEnterRangeState(MIN_LOOP_DURATION_MS, false)).toBe(true);
    expect(canEnterRangeState(0, true)).toBe(true);
  });

  it('Feature: playback-marker-control-dock, Property 2: three taps return to the starting state', () => {
    fc.assert(fc.property(fc.constantFrom('off', 'markers', 'range'), start => {
      expect(nextInnerLoopState(nextInnerLoopState(nextInnerLoopState(start)))).toBe(start);
    }), { numRuns: 100 });
  });

  it('Feature: playback-marker-control-dock, Property 5: speed labels preserve supported values', () => {
    fc.assert(fc.property(fc.constantFrom(0.75, 0.8, 1, 1.25, 2), speed => {
      expect(Number.parseFloat(formatSpeedLabel(speed))).toBe(speed);
    }), { numRuns: 100 });
  });
});
