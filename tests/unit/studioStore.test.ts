/**
 * Unit tests for stem separation store actions.
 * Feature: demucs-stem-separation
 * Requirements: 6.1, 6.2, 6.3, 6.4, 4.5, 4.6
 */

import * as fc from 'fast-check';
import { create } from 'zustand';
import { LayerId } from '../../src/hooks/useStudioStore';
import { StemSeparationStatus } from '../../src/features/stemSeparation/types';

// ---------------------------------------------------------------------------
// Minimal store factory — creates a fresh isolated instance per test.
// We only include the stem separation slice to avoid pulling in async
// dependencies (ProjectManager, ImportEngine) that require a full RN env.
// ---------------------------------------------------------------------------

interface StemSlice {
  stemSeparationStatus: StemSeparationStatus;
  stemSeparationProgress: number;
  separatedStemUris: Partial<Record<LayerId, string>>;
  setStemSeparationStatus: (status: StemSeparationStatus) => void;
  setStemSeparationProgress: (progress: number) => void;
  setSeparatedStemUris: (uris: Partial<Record<LayerId, string>>) => void;
}

function createStemStore() {
  return create<StemSlice>((set) => ({
    stemSeparationStatus: 'idle',
    stemSeparationProgress: 0,
    separatedStemUris: {},
    setStemSeparationStatus: (status) => set({ stemSeparationStatus: status }),
    setStemSeparationProgress: (progress) => set({ stemSeparationProgress: progress }),
    setSeparatedStemUris: (uris) => set({ separatedStemUris: uris }),
  }));
}

const VALID_LAYER_IDS: LayerId[] = ['vocals', 'drums', 'bass', 'piano', 'guitar', 'other'];
const VALID_STATUSES: StemSeparationStatus[] = ['idle', 'processing', 'complete', 'error'];

// ---------------------------------------------------------------------------
// Example tests — Requirements 6.4
// ---------------------------------------------------------------------------

describe('setStemSeparationStatus', () => {
  it('updates stemSeparationStatus to the given value', () => {
    const store = createStemStore();
    store.getState().setStemSeparationStatus('processing');
    expect(store.getState().stemSeparationStatus).toBe('processing');
  });

  it('starts with default status "idle"', () => {
    const store = createStemStore();
    expect(store.getState().stemSeparationStatus).toBe('idle');
  });

  it('transitions through the full lifecycle: idle → processing → complete', () => {
    const store = createStemStore();
    const { setStemSeparationStatus } = store.getState();
    setStemSeparationStatus('processing');
    expect(store.getState().stemSeparationStatus).toBe('processing');
    setStemSeparationStatus('complete');
    expect(store.getState().stemSeparationStatus).toBe('complete');
  });

  it('can be set to "error"', () => {
    const store = createStemStore();
    store.getState().setStemSeparationStatus('error');
    expect(store.getState().stemSeparationStatus).toBe('error');
  });
});

describe('setStemSeparationProgress', () => {
  it('updates stemSeparationProgress to the given value', () => {
    const store = createStemStore();
    store.getState().setStemSeparationProgress(42);
    expect(store.getState().stemSeparationProgress).toBe(42);
  });

  it('starts with default progress 0', () => {
    const store = createStemStore();
    expect(store.getState().stemSeparationProgress).toBe(0);
  });

  it('accepts boundary values 0 and 100', () => {
    const store = createStemStore();
    store.getState().setStemSeparationProgress(0);
    expect(store.getState().stemSeparationProgress).toBe(0);
    store.getState().setStemSeparationProgress(100);
    expect(store.getState().stemSeparationProgress).toBe(100);
  });
});

describe('setSeparatedStemUris', () => {
  it('updates separatedStemUris to the given record', () => {
    const store = createStemStore();
    const uris: Partial<Record<LayerId, string>> = { vocals: 'file:///vocals.m4a', drums: 'file:///drums.m4a' };
    store.getState().setSeparatedStemUris(uris);
    expect(store.getState().separatedStemUris).toEqual(uris);
  });

  it('starts with an empty record', () => {
    const store = createStemStore();
    expect(store.getState().separatedStemUris).toEqual({});
  });

  it('replaces the previous value entirely', () => {
    const store = createStemStore();
    store.getState().setSeparatedStemUris({ vocals: 'file:///v1.m4a' });
    store.getState().setSeparatedStemUris({ drums: 'file:///d1.m4a' });
    expect(store.getState().separatedStemUris).toEqual({ drums: 'file:///d1.m4a' });
  });
});

// ---------------------------------------------------------------------------
// Property 8: status is "processing" and progress is 0 immediately after
// initiation; "complete" and 100 after success. — Requirements 4.5, 4.6
// ---------------------------------------------------------------------------

describe('Property 8: separation lifecycle state transitions', () => {
  // Feature: demucs-stem-separation, Property 8: Store state transitions on separation lifecycle
  it('status is "processing" and progress is 0 after initiation', () => {
    const store = createStemStore();
    store.getState().setStemSeparationStatus('processing');
    store.getState().setStemSeparationProgress(0);
    expect(store.getState().stemSeparationStatus).toBe('processing');
    expect(store.getState().stemSeparationProgress).toBe(0);
  });

  it('status is "complete" and progress is 100 after success', () => {
    const store = createStemStore();
    store.getState().setStemSeparationStatus('processing');
    store.getState().setStemSeparationProgress(0);
    store.getState().setStemSeparationProgress(100);
    store.getState().setStemSeparationStatus('complete');
    expect(store.getState().stemSeparationStatus).toBe('complete');
    expect(store.getState().stemSeparationProgress).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// Property 9: store invariants after any sequence of stem separation actions.
// — Requirements 6.1, 6.2, 6.3
// ---------------------------------------------------------------------------

describe('Property 9: store invariants after arbitrary action sequences', () => {
  // Feature: demucs-stem-separation, Property 9: Store invariants

  it('stemSeparationStatus is always one of {idle, processing, complete, error}', () => {
    // fast-check: pick a random valid status and verify it round-trips
    fc.assert(
      fc.property(
        fc.constantFrom<StemSeparationStatus>('idle', 'processing', 'complete', 'error'),
        (status) => {
          const store = createStemStore();
          store.getState().setStemSeparationStatus(status);
          return VALID_STATUSES.includes(store.getState().stemSeparationStatus);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('stemSeparationProgress is always in [0, 100] for any value set within that range', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (progress) => {
          const store = createStemStore();
          store.getState().setStemSeparationProgress(progress);
          const stored = store.getState().stemSeparationProgress;
          return stored >= 0 && stored <= 100;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('all keys in separatedStemUris are valid LayerId values', () => {
    fc.assert(
      fc.property(
        // Generate a subset of valid LayerIds mapped to file URIs
        fc.array(fc.constantFrom<LayerId>(...VALID_LAYER_IDS), { minLength: 0, maxLength: 6 }),
        (layerIds) => {
          const store = createStemStore();
          const uris: Partial<Record<LayerId, string>> = {};
          layerIds.forEach((id) => { uris[id] = `file:///${id}.m4a`; });
          store.getState().setSeparatedStemUris(uris);
          const keys = Object.keys(store.getState().separatedStemUris);
          return keys.every((k) => VALID_LAYER_IDS.includes(k as LayerId));
        }
      ),
      { numRuns: 100 }
    );
  });

  it('independent actions do not interfere with each other', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<StemSeparationStatus>('idle', 'processing', 'complete', 'error'),
        fc.integer({ min: 0, max: 100 }),
        fc.array(fc.constantFrom<LayerId>(...VALID_LAYER_IDS), { minLength: 0, maxLength: 6 }),
        (status, progress, layerIds) => {
          const store = createStemStore();
          const uris: Partial<Record<LayerId, string>> = {};
          layerIds.forEach((id) => { uris[id] = `file:///${id}.m4a`; });

          store.getState().setStemSeparationStatus(status);
          store.getState().setStemSeparationProgress(progress);
          store.getState().setSeparatedStemUris(uris);

          const state = store.getState();
          return (
            state.stemSeparationStatus === status &&
            state.stemSeparationProgress === progress &&
            Object.keys(state.separatedStemUris).every((k) => VALID_LAYER_IDS.includes(k as LayerId))
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});
