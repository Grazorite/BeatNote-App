import * as fc from 'fast-check';
import { create, type StoreApi, type UseBoundStore } from 'zustand';

import {
  type StudioStore,
  studioStoreCreator,
} from '../../src/hooks/useStudioStore';
import {
  MIN_LOOP_DURATION_MS,
  RESTORE_WINDOW_MS,
  isValidLoopRange,
} from '../../src/utils/loopRange';

const createStore = (): UseBoundStore<StoreApi<StudioStore>> => create<StudioStore>(studioStoreCreator);

describe('loop-range store actions', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('validates, normalizes, and clears ranges through one setter', () => {
    const store = createStore();
    expect(store.getState().setLoopRange(8000.4, 2000.5)).toBe(true);
    expect(store.getState()).toMatchObject({ loopStartMs: 2001, loopEndMs: 8000, isLoopRangeEnabled: false });
    expect(store.getState().setLoopRange(Number.NaN, 9000)).toBe(false);
    expect(store.getState()).toMatchObject({ loopStartMs: 2001, loopEndMs: 8000 });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(store.getState().setLoopRange(null, null)).toBe(true);
    expect(store.getState()).toMatchObject({ loopStartMs: null, loopEndMs: null, isLoopRangeEnabled: false });
  });

  it('sets either bound at the playhead and preserves enablement when replacing a range', () => {
    const store = createStore();
    store.getState().setSongLoaded(true);
    store.getState().setLoopRange(1000, 4000);
    store.getState().setLoopRangeEnabled(true);
    store.getState().setLoopStartAtPlayhead(2000.4);
    expect(store.getState()).toMatchObject({ loopStartMs: 2000, loopEndMs: 4000, isLoopRangeEnabled: true });
    store.getState().setLoopEndAtPlayhead(3000.6);
    expect(store.getState()).toMatchObject({ loopStartMs: 2000, loopEndMs: 3001, isLoopRangeEnabled: true });
  });

  it('rejects set-at-playhead values that cannot form a valid range', () => {
    const store = createStore();
    store.getState().setSongDuration(1000);
    const before = store.getState();
    store.getState().setLoopStartAtPlayhead(900);
    expect(store.getState()).toMatchObject({ loopStartMs: before.loopStartMs, loopEndMs: before.loopEndMs });
    store.getState().setLoopEndAtPlayhead(100);
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });

  it('nudges either bound by BPM-derived steps and clamps to the minimum duration', () => {
    const store = createStore();
    store.getState().setLoopRange(1000, 3000);
    store.getState().nudgeLoopBound('start', 3);
    expect(store.getState()).toMatchObject({ loopStartMs: 2500, loopEndMs: 3000 });
    store.getState().nudgeLoopBound('end', -10);
    expect(store.getState()).toMatchObject({ loopStartMs: 2500, loopEndMs: 3000 });
  });

  it('clears and restores a snapshot before expiry', () => {
    const store = createStore();
    store.getState().setSongLoaded(true);
    store.getState().setLoopRange(1000, 3000);
    store.getState().setLoopRangeEnabled(true);
    store.getState().clearLoopRange(10000);
    expect(store.getState()).toMatchObject({ loopStartMs: null, loopEndMs: null, isLoopRangeEnabled: false });
    expect(store.getState().loopRestoreSnapshot?.expiresAtMs).toBe(10000 + RESTORE_WINDOW_MS);
    store.getState().restoreLoopRange(10000 + RESTORE_WINDOW_MS - 1);
    expect(store.getState()).toMatchObject({ loopStartMs: 1000, loopEndMs: 3000, isLoopRangeEnabled: true });
    expect(store.getState().loopRestoreSnapshot).toBeNull();
  });

  it('drops expired, absent, or no-longer-valid restore snapshots', () => {
    const expired = createStore();
    expired.getState().setLoopRange(1000, 3000);
    expired.getState().clearLoopRange(100);
    expired.getState().restoreLoopRange(100 + RESTORE_WINDOW_MS);
    expect(expired.getState().loopRestoreSnapshot).toBeNull();
    expect(expired.getState().loopStartMs).toBeNull();

    const invalid = createStore();
    invalid.getState().setLoopRange(1000, 3000);
    invalid.getState().clearLoopRange(100);
    invalid.getState().setSongDuration(400);
    invalid.getState().restoreLoopRange(101);
    expect(invalid.getState().loopRestoreSnapshot).toBeNull();
    expect(invalid.getState().loopStartMs).toBeNull();

    const absent = createStore();
    absent.getState().restoreLoopRange(0);
    expect(absent.getState().loopRestoreSnapshot).toBeNull();
  });

  it('rounds duration halves up and reclamps a retained valid range', () => {
    const store = createStore();
    store.getState().setLoopRange(1000, 180000);
    store.getState().setSongDuration(179987.4);
    expect(store.getState()).toMatchObject({
      songDuration: 179987,
      loopStartMs: 1000,
      loopEndMs: 179987,
    });
    store.getState().setSongDuration(179987.5);
    expect(store.getState().songDuration).toBe(179988);
  });

  it('clears and warns once when a duration change makes the range too short', () => {
    const store = createStore();
    store.getState().setLoopRange(179000, 180000);
    store.getState().setSongDuration(179200);
    expect(store.getState()).toMatchObject({ loopStartMs: null, loopEndMs: null, isLoopRangeEnabled: false });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('retains a pending range and restores its prior enabled state when duration returns', () => {
    const store = createStore();
    store.getState().setSongLoaded(true);
    store.getState().setLoopRange(1000, 3000);
    store.getState().setLoopRangeEnabled(true);
    store.getState().setSongDuration(0);
    expect(store.getState()).toMatchObject({
      loopStartMs: 1000,
      loopEndMs: 3000,
      isLoopRangeEnabled: false,
      pendingLoopRangeEnabled: true,
    });
    store.getState().setSongDuration(10000);
    expect(store.getState()).toMatchObject({
      loopStartMs: 1000,
      loopEndMs: 3000,
      isLoopRangeEnabled: true,
      pendingLoopRangeEnabled: false,
    });
  });

  it('does not touch loop state or warn when rounded duration is unchanged', () => {
    const store = createStore();
    store.getState().setLoopRange(1000, 3000);
    const before = store.getState();
    store.getState().setSongDuration(180000.4);
    expect(store.getState()).toMatchObject({
      loopStartMs: before.loopStartMs,
      loopEndMs: before.loopEndMs,
      isLoopRangeEnabled: before.isLoopRangeEnabled,
    });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('rejects non-finite inputs without changing the range', () => {
    const store = createStore();
    store.getState().setLoopRange(1000, 3000);
    const before = store.getState();
    expect(store.getState().setLoopRange(Infinity, 4000)).toBe(false);
    expect(store.getState()).toMatchObject({
      loopStartMs: before.loopStartMs,
      loopEndMs: before.loopEndMs,
      isLoopRangeEnabled: before.isLoopRangeEnabled,
    });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('enables only when a song and valid range exist, and reset clears all loop state', () => {
    const store = createStore();
    store.getState().setLoopRange(1000, 3000);
    store.getState().setLoopRangeEnabled(true);
    expect(store.getState().isLoopRangeEnabled).toBe(false);
    store.getState().setSongLoaded(true);
    store.getState().toggleLoopRangeEnabled();
    expect(store.getState().isLoopRangeEnabled).toBe(true);
    store.getState().resetLoopForNewAudio();
    expect(store.getState()).toMatchObject({
      loopStartMs: null,
      loopEndMs: null,
      isLoopRangeEnabled: false,
      isLoopMarkerActive: false,
      loopRestoreSnapshot: null,
    });
  });

  it('keeps marker and range loop modes mutually exclusive', () => {
    const store = createStore();
    store.getState().setSongLoaded(true);
    store.getState().setLoopRange(1000, 3000);
    store.getState().toggleLoopMarker();
    expect(store.getState()).toMatchObject({ isLoopMarkerActive: true, isLoopRangeEnabled: false });
    store.getState().toggleLoopRangeEnabled();
    expect(store.getState()).toMatchObject({ isLoopMarkerActive: false, isLoopRangeEnabled: true });
    store.getState().toggleLoopMarker();
    expect(store.getState()).toMatchObject({ isLoopMarkerActive: true, isLoopRangeEnabled: false });
  });

  it('keeps mutual exclusion when a pending range is restored after duration measurement', () => {
    const store = createStore();
    store.getState().setSongLoaded(true);
    store.getState().setLoopRange(1000, 3000);
    store.getState().setLoopRangeEnabled(true);
    store.getState().setSongDuration(0);
    store.getState().toggleLoopMarker();
    expect(store.getState().isLoopMarkerActive).toBe(true);
    store.getState().setSongDuration(10000);
    expect(store.getState()).toMatchObject({ isLoopMarkerActive: false, isLoopRangeEnabled: true });
  });
});

describe('loop-range store properties', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('Property 8: set-at-playhead returns a valid range or makes no range change', () => {
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 10000 }),
      fc.constantFrom<'start' | 'end'>('start', 'end'),
      (playhead, bound) => {
        const store = createStore();
        store.getState().setSongDuration(10000);
        const before = {
          loopStartMs: store.getState().loopStartMs,
          loopEndMs: store.getState().loopEndMs,
          isLoopRangeEnabled: store.getState().isLoopRangeEnabled,
        };
        if (bound === 'start') store.getState().setLoopStartAtPlayhead(playhead);
        else store.getState().setLoopEndAtPlayhead(playhead);
        const after = store.getState();
        const range = { loopStartMs: after.loopStartMs, loopEndMs: after.loopEndMs };
        const unchanged = after.loopStartMs === before.loopStartMs
          && after.loopEndMs === before.loopEndMs
          && after.isLoopRangeEnabled === before.isLoopRangeEnabled;
        expect(isValidLoopRange(range, after.songDuration) || unchanged).toBe(true);
        if (isValidLoopRange(range, after.songDuration)) {
          expect(bound === 'start' ? after.loopStartMs : after.loopEndMs).toBe(playhead);
          expect((after.loopEndMs as number) - (after.loopStartMs as number)).toBeGreaterThanOrEqual(MIN_LOOP_DURATION_MS);
        }
      },
    ), { numRuns: 100 });
  });

  it('Property 10: enabled always implies a valid range after action sequences', () => {
    const actionArb = fc.record({
      kind: fc.constantFrom('set', 'clear', 'restore', 'enable', 'toggle', 'duration', 'reset'),
      a: fc.integer({ min: -1000, max: 200000 }),
      b: fc.integer({ min: -1000, max: 200000 }),
      now: fc.integer({ min: 0, max: 20000 }),
    });
    fc.assert(fc.property(fc.array(actionArb, { minLength: 1, maxLength: 40 }), actions => {
      const store = createStore();
      store.getState().setSongLoaded(true);
      for (const action of actions) {
        const state = store.getState();
        if (action.kind === 'set') state.setLoopRange(action.a, action.b);
        else if (action.kind === 'clear') state.clearLoopRange(action.now);
        else if (action.kind === 'restore') state.restoreLoopRange(action.now);
        else if (action.kind === 'enable') state.setLoopRangeEnabled(action.a % 2 === 0);
        else if (action.kind === 'toggle') state.toggleLoopRangeEnabled();
        else if (action.kind === 'duration') state.setSongDuration(Math.max(0, action.a));
        else state.resetLoopForNewAudio();

        const after = store.getState();
        if (after.isLoopRangeEnabled) {
          expect(isValidLoopRange(
            { loopStartMs: after.loopStartMs, loopEndMs: after.loopEndMs },
            after.songDuration,
          )).toBe(true);
        }
      }
    }), { numRuns: 100 });
  });
});
