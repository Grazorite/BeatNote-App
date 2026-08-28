/**
 * Unit + property tests for stemCache.ts
 * Feature: demucs-stem-separation
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.6
 */

import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Mock expo-file-system before importing the module under test.
// The cache logic only calls getInfoAsync, makeDirectoryAsync, deleteAsync.
// ---------------------------------------------------------------------------
const mockGetInfoAsync = jest.fn();
const mockMakeDirectoryAsync = jest.fn();
const mockDeleteAsync = jest.fn();

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///documents/',
  getInfoAsync: mockGetInfoAsync,
  makeDirectoryAsync: mockMakeDirectoryAsync,
  deleteAsync: mockDeleteAsync,
}));

// AsyncStorage is auto-mapped by jest.config.js to the in-memory mock.
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  computeHash,
  lookupCache,
  storeCache,
  deleteCache,
  getAllCacheEntries,
} from '../../src/features/stemSeparation/stemCache';
import { LayerId } from '../../src/hooks/useStudioStore';
import { StemCacheEntry } from '../../src/features/stemSeparation/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEntry(
  audioUri: string,
  stemCount: 4 | 6,
  stems: Partial<Record<LayerId, string>> = { vocals: 'file:///v.m4a' }
): StemCacheEntry {
  return {
    sourceHash: computeHash(audioUri, stemCount),
    stemCount,
    stems,
    createdAt: new Date().toISOString(),
  };
}

// Reset all mocks and AsyncStorage state before each test.
beforeEach(() => {
  jest.clearAllMocks();
  // Clear the in-memory AsyncStorage store
  (AsyncStorage.clear as jest.Mock)();
  // Default file-system behaviour: directory does not exist → create it
  mockGetInfoAsync.mockResolvedValue({ exists: false });
  mockMakeDirectoryAsync.mockResolvedValue(undefined);
  mockDeleteAsync.mockResolvedValue(undefined);
});

// ---------------------------------------------------------------------------
// Edge case: lookup on empty cache returns null
// ---------------------------------------------------------------------------

describe('lookupCache', () => {
  it('returns null when the cache is empty', async () => {
    const result = await lookupCache('nonexistent-hash');
    expect(result).toBeNull();
  });

  it('returns null for an unknown hash when other entries exist', async () => {
    const entry = makeEntry('file:///song.mp3', 4);
    await storeCache(entry);
    const result = await lookupCache('totally-different-hash');
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Property 1: Cache round-trip
// Feature: demucs-stem-separation, Property 1: Cache round-trip
// ---------------------------------------------------------------------------

describe('Property 1: cache round-trip', () => {
  it('store then lookup returns identical sourceHash, stemCount, stems, and createdAt', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 80 }),
        fc.constantFrom<4 | 6>(4, 6),
        async (audioUri, stemCount) => {
          // Reset storage between iterations
          await AsyncStorage.clear();

          const entry = makeEntry(audioUri, stemCount);
          await storeCache(entry);
          const retrieved = await lookupCache(entry.sourceHash);

          return (
            retrieved !== null &&
            retrieved.sourceHash === entry.sourceHash &&
            retrieved.stemCount === entry.stemCount &&
            JSON.stringify(retrieved.stems) === JSON.stringify(entry.stems) &&
            retrieved.createdAt === entry.createdAt
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2: Hash determinism
// Feature: demucs-stem-separation, Property 2: Hash determinism
// ---------------------------------------------------------------------------

describe('Property 2: hash determinism', () => {
  it('same (audioUri, stemCount) always produces the same hash', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.constantFrom<4 | 6>(4, 6),
        (audioUri, stemCount) => {
          const h1 = computeHash(audioUri, stemCount);
          const h2 = computeHash(audioUri, stemCount);
          return h1 === h2 && h1.length === 16;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('different stemCount values produce different hashes for the same URI', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        (audioUri) => {
          const h4 = computeHash(audioUri, 4);
          const h6 = computeHash(audioUri, 6);
          return h4 !== h6;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 3: Metadata completeness
// Feature: demucs-stem-separation, Property 3: Metadata completeness
// ---------------------------------------------------------------------------

describe('Property 3: metadata completeness', () => {
  it('stored entry always has all four required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 80 }),
        fc.constantFrom<4 | 6>(4, 6),
        async (audioUri, stemCount) => {
          await AsyncStorage.clear();

          const entry = makeEntry(audioUri, stemCount, { vocals: 'file:///v.m4a', drums: 'file:///d.m4a' });
          await storeCache(entry);
          const retrieved = await lookupCache(entry.sourceHash);

          if (!retrieved) return false;

          return (
            typeof retrieved.sourceHash === 'string' &&
            (retrieved.stemCount === 4 || retrieved.stemCount === 6) &&
            typeof retrieved.stems === 'object' &&
            Object.keys(retrieved.stems).length >= 1 &&
            typeof retrieved.createdAt === 'string'
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4: Deletion inverse
// Feature: demucs-stem-separation, Property 4: Deletion inverse
// ---------------------------------------------------------------------------

describe('Property 4: deletion inverse', () => {
  it('store → delete → lookup returns null', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 80 }),
        fc.constantFrom<4 | 6>(4, 6),
        async (audioUri, stemCount) => {
          await AsyncStorage.clear();
          mockGetInfoAsync.mockResolvedValue({ exists: true });

          const entry = makeEntry(audioUri, stemCount);
          await storeCache(entry);
          await deleteCache(entry.sourceHash);
          const result = await lookupCache(entry.sourceHash);
          return result === null;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Edge case: two entries with different hashes do not overwrite each other
// ---------------------------------------------------------------------------

describe('multiple entries', () => {
  it('two entries with different hashes coexist independently', async () => {
    const entry1 = makeEntry('file:///song-a.mp3', 4, { vocals: 'file:///a-vocals.m4a' });
    const entry2 = makeEntry('file:///song-b.mp3', 6, { drums: 'file:///b-drums.m4a' });

    // Ensure hashes differ (different URIs → different hashes)
    expect(entry1.sourceHash).not.toBe(entry2.sourceHash);

    await storeCache(entry1);
    await storeCache(entry2);

    const r1 = await lookupCache(entry1.sourceHash);
    const r2 = await lookupCache(entry2.sourceHash);

    expect(r1).not.toBeNull();
    expect(r2).not.toBeNull();
    expect(r1!.sourceHash).toBe(entry1.sourceHash);
    expect(r2!.sourceHash).toBe(entry2.sourceHash);
    expect(r1!.stemCount).toBe(4);
    expect(r2!.stemCount).toBe(6);
  });

  it('deleting one entry does not affect the other', async () => {
    const entry1 = makeEntry('file:///song-a.mp3', 4);
    const entry2 = makeEntry('file:///song-b.mp3', 4);

    await storeCache(entry1);
    await storeCache(entry2);

    mockGetInfoAsync.mockResolvedValue({ exists: true });
    await deleteCache(entry1.sourceHash);

    expect(await lookupCache(entry1.sourceHash)).toBeNull();
    expect(await lookupCache(entry2.sourceHash)).not.toBeNull();
  });

  it('getAllCacheEntries returns all stored entries', async () => {
    const entry1 = makeEntry('file:///song-a.mp3', 4);
    const entry2 = makeEntry('file:///song-b.mp3', 6);

    await storeCache(entry1);
    await storeCache(entry2);

    const all = await getAllCacheEntries();
    expect(all).toHaveLength(2);
    const hashes = all.map((e) => e.sourceHash);
    expect(hashes).toContain(entry1.sourceHash);
    expect(hashes).toContain(entry2.sourceHash);
  });
});
