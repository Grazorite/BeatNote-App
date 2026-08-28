/**
 * stemCache.ts — Persist and retrieve separated stem audio files.
 *
 * Cache metadata is stored in AsyncStorage under `beatnote_stem_cache`.
 * Stem audio files live in the expo-file-system Documents directory under
 * `beatnote_stems/<sourceHash>/`.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.6
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { LayerId } from '../../hooks/useStudioStore';
import { StemCacheEntry, StemCacheMetadata } from './types';

const CACHE_METADATA_KEY = 'beatnote_stem_cache';
const STEMS_DIR = 'beatnote_stems';

// ---------------------------------------------------------------------------
// Hash
// ---------------------------------------------------------------------------

/**
 * Experimental in MVP: stem cache is implemented but not yet user-facing.
 */

/**
 * Compute a deterministic 16-hex-char source hash from an audio URI and stem count.
 * Uses a React Native-safe FNV-1a 64-bit hash (no Node `crypto` dependency).
 */
export function computeHash(audioUri: string, stemCount: 4 | 6): string {
  const value = `${audioUri}:${stemCount}`;
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;

  for (let i = 0; i < value.length; i += 1) {
    hash ^= BigInt(value.charCodeAt(i));
    hash = (hash * prime) & mask;
  }

  return hash.toString(16).padStart(16, '0').slice(0, 16);
}

// ---------------------------------------------------------------------------
// Metadata helpers
// ---------------------------------------------------------------------------

async function readMetadata(): Promise<StemCacheMetadata> {
  const raw = await AsyncStorage.getItem(CACHE_METADATA_KEY);
  if (!raw) return { entries: {} };
  try {
    return JSON.parse(raw) as StemCacheMetadata;
  } catch {
    return { entries: {} };
  }
}

async function writeMetadata(metadata: StemCacheMetadata): Promise<void> {
  await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Look up a cached stem separation result by source hash.
 * Returns `null` if no entry exists for the given hash.
 */
export async function lookupCache(sourceHash: string): Promise<StemCacheEntry | null> {
  const metadata = await readMetadata();
  return metadata.entries[sourceHash] ?? null;
}

/**
 * Persist a stem separation result to the cache.
 * Creates the stem directory under the Documents directory and writes metadata.
 */
export async function storeCache(entry: StemCacheEntry): Promise<void> {
  // Ensure the stem directory exists
  const stemsDir = `${FileSystem.documentDirectory ?? ''}${STEMS_DIR}/${entry.sourceHash}`;
  const dirInfo = await FileSystem.getInfoAsync(stemsDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(stemsDir, { intermediates: true });
  }

  const metadata = await readMetadata();
  metadata.entries[entry.sourceHash] = entry;
  await writeMetadata(metadata);
}

/**
 * Delete a cached entry: removes stem audio files from the file system
 * and removes the metadata entry from AsyncStorage.
 */
export async function deleteCache(sourceHash: string): Promise<void> {
  const stemsDir = `${FileSystem.documentDirectory ?? ''}${STEMS_DIR}/${sourceHash}`;
  const dirInfo = await FileSystem.getInfoAsync(stemsDir);
  if (dirInfo.exists) {
    await FileSystem.deleteAsync(stemsDir, { idempotent: true });
  }

  const metadata = await readMetadata();
  delete metadata.entries[sourceHash];
  await writeMetadata(metadata);
}

/**
 * Return all cached entries as an array.
 */
export async function getAllCacheEntries(): Promise<StemCacheEntry[]> {
  const metadata = await readMetadata();
  return Object.values(metadata.entries);
}

/**
 * Return the total size in bytes of all cached stem files.
 * Sums the size of every file URI stored across all entries.
 */
export async function getCacheSize(): Promise<number> {
  const entries = await getAllCacheEntries();
  let total = 0;
  for (const entry of entries) {
    for (const uri of Object.values(entry.stems) as string[]) {
      try {
        const info = await FileSystem.getInfoAsync(uri);
        if (info.exists && 'size' in info) {
          total += (info as { exists: true; size: number }).size;
        }
      } catch {
        // File may have been deleted externally — skip
      }
    }
  }
  return total;
}
