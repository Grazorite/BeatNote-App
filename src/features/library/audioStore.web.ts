import { selectOrphans } from '../../utils/importDecisions';
import type { SupportedAudioExtension } from '../../types/library';
import type { AudioStoreAdapter, StagedAudio } from './audioStoreTypes';
import { ImportError } from './audioStoreTypes';

const DATABASE_NAME = 'beatnote-audio';
const DATABASE_VERSION = 1;
const AUDIO_STORE = 'audio';

interface StagedWebAudio {
  blob: Blob;
  hash: string | null;
}

interface StoredWebAudio {
  id: string;
  blob: Blob;
  byteSize: number;
  hash: string;
  extension: string;
  createdAt: string;
}

const stagedAudio = new Map<string, StagedWebAudio>();
let activeObjectUrl: { relativePath: string; url: string } | null = null;
let persistenceRequested = false;

const revokeActiveObjectUrl = (relativePath?: string): void => {
  if (activeObjectUrl === null) return;
  if (relativePath !== undefined && activeObjectUrl.relativePath !== relativePath) return;
  URL.revokeObjectURL(activeObjectUrl.url);
  activeObjectUrl = null;
};

const openDatabase = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(AUDIO_STORE)) {
      database.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
    }
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error('Unable to open audio storage'));
});

const runRequest = <T>(request: IDBRequest<T>): Promise<T> => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error('Audio storage request failed'));
});

const readStoredAudio = async (id: string): Promise<StoredWebAudio | null> => {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(AUDIO_STORE, 'readonly');
    const value = await runRequest(transaction.objectStore(AUDIO_STORE).get(id));
    return (value as StoredWebAudio | undefined) ?? null;
  } finally {
    database.close();
  }
};

const allStoredAudio = async (): Promise<StoredWebAudio[]> => {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(AUDIO_STORE, 'readonly');
    return await runRequest(transaction.objectStore(AUDIO_STORE).getAll()) as StoredWebAudio[];
  } finally {
    database.close();
  }
};

const writeStoredAudio = async (value: StoredWebAudio): Promise<void> => {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(AUDIO_STORE, 'readwrite');
      transaction.objectStore(AUDIO_STORE).put(value);
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(
        transaction.error ?? new Error('Audio storage transaction was aborted'),
      );
      transaction.onerror = () => reject(
        transaction.error ?? new Error('Audio storage transaction failed'),
      );
    });
  } finally {
    database.close();
  }
};

const deleteStoredAudio = async (id: string): Promise<void> => {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(AUDIO_STORE, 'readwrite');
      transaction.objectStore(AUDIO_STORE).delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(
        transaction.error ?? new Error('Audio delete transaction was aborted'),
      );
      transaction.onerror = () => reject(
        transaction.error ?? new Error('Audio delete transaction failed'),
      );
    });
  } finally {
    database.close();
  }
};

const stagedValue = (staged: StagedAudio): StagedWebAudio => {
  const value = stagedAudio.get(staged.stagingRef);
  if (!value) {
    throw new ImportError('stagedAudioMissing', 'The staged audio is no longer available');
  }
  return value;
};

const bytesToHex = (bytes: Uint8Array): string => Array.from(bytes)
  .map(value => value.toString(16).padStart(2, '0'))
  .join('');

const requestPersistentStorage = async (): Promise<void> => {
  if (persistenceRequested || typeof navigator.storage?.persist !== 'function') return;
  persistenceRequested = true;
  try {
    if (typeof navigator.storage.persisted === 'function' && await navigator.storage.persisted()) {
      return;
    }
    if (!await navigator.storage.persist()) {
      console.warn('Browser declined persistent storage for imported audio');
    }
  } catch (error) {
    console.warn('Unable to request persistent browser audio storage', error);
  }
};

export const audioStore: AudioStoreAdapter = {
  async ensureDirectories(): Promise<void> {
    const database = await openDatabase();
    database.close();
  },

  async availableBytes(): Promise<number | null> {
    if (typeof navigator.storage?.estimate !== 'function') return null;
    try {
      const estimate = await navigator.storage.estimate();
      if (typeof estimate.quota !== 'number' || typeof estimate.usage !== 'number') return null;
      return Math.max(0, estimate.quota - estimate.usage);
    } catch {
      return null;
    }
  },

  async stage(
    sourceUri: string,
    expectedBytes: number,
    _extension: SupportedAudioExtension,
  ): Promise<StagedAudio> {
    const response = await fetch(sourceUri);
    if (!response.ok) throw new Error(`Unable to read selected audio (${response.status})`);
    const blob = await response.blob();
    if (blob.size !== expectedBytes) {
      throw new ImportError('copyIncomplete', `Copied ${blob.size} of ${expectedBytes} bytes`);
    }
    const stagingRef = crypto.randomUUID().toLocaleLowerCase('en-US');
    stagedAudio.set(stagingRef, { blob, hash: null });
    return { stagingRef, byteSize: blob.size };
  },

  async hash(staged: StagedAudio): Promise<string> {
    const value = stagedValue(staged);
    const digest = await crypto.subtle.digest('SHA-256', await value.blob.arrayBuffer());
    const hash = `sha256:${bytesToHex(new Uint8Array(digest))}`;
    value.hash = hash;
    return hash;
  },

  async probeDuration(staged: StagedAudio, timeoutMs: number): Promise<number> {
    const objectUrl = URL.createObjectURL(stagedValue(staged).blob);
    try {
      return await new Promise<number>((resolve, reject) => {
        const audio = new Audio();
        let settled = false;
        const finish = (result: { durationMs: number } | { error: Error }): void => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeout);
          audio.onloadedmetadata = null;
          audio.onerror = null;
          audio.removeAttribute('src');
          audio.load();
          if ('error' in result) reject(result.error);
          else resolve(result.durationMs);
        };
        const timeout = window.setTimeout(() => {
          finish({
            error: new ImportError(
              'decodeTimeout',
              'Timed out while reading the audio duration',
            ),
          });
        }, timeoutMs);
        audio.onloadedmetadata = () => {
          if (Number.isFinite(audio.duration) && audio.duration > 0) {
            finish({ durationMs: audio.duration * 1_000 });
          } else {
            finish({ error: new Error('Audio duration is not available') });
          }
        };
        audio.onerror = () => {
          finish({ error: new Error('The selected file could not be decoded as audio') });
        };
        audio.preload = 'metadata';
        audio.src = objectUrl;
      });
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  },

  async commit(staged: StagedAudio, physicalName: string): Promise<string> {
    const value = stagedValue(staged);
    if (value.hash === null) throw new Error('Staged audio must be hashed before commit');
    const finalDot = physicalName.lastIndexOf('.');
    await writeStoredAudio({
      id: physicalName,
      blob: value.blob,
      byteSize: value.blob.size,
      hash: value.hash,
      extension: finalDot >= 0 ? physicalName.slice(finalDot + 1) : '',
      createdAt: new Date().toISOString(),
    });
    stagedAudio.delete(staged.stagingRef);
    await requestPersistentStorage();
    return physicalName;
  },

  async discard(staged: StagedAudio): Promise<void> {
    stagedAudio.delete(staged.stagingRef);
  },

  async resolvePlayableUri(relativePath: string): Promise<string> {
    if (activeObjectUrl?.relativePath === relativePath) return activeObjectUrl.url;
    const value = await readStoredAudio(relativePath);
    if (!value || value.byteSize <= 0 || value.blob.size <= 0) {
      throw new Error('Managed audio is missing');
    }
    revokeActiveObjectUrl();
    const url = URL.createObjectURL(value.blob);
    activeObjectUrl = { relativePath, url };
    return url;
  },

  async checkAvailable(relativePath: string): Promise<'available' | 'missing'> {
    try {
      const value = await readStoredAudio(relativePath);
      return value && value.byteSize > 0 && value.blob.size > 0 ? 'available' : 'missing';
    } catch {
      return 'missing';
    }
  },

  async remove(relativePath: string): Promise<void> {
    await deleteStoredAudio(relativePath);
    revokeActiveObjectUrl(relativePath);
  },

  async sweepOrphans(referenced: ReadonlySet<string>, minAgeMs: number): Promise<number> {
    const values = await allStoredAudio();
    const selected = selectOrphans(
      values.map(value => ({
        value,
        relativePath: value.id,
        modifiedAtMs: Date.parse(value.createdAt),
      })),
      referenced,
      Date.now(),
      minAgeMs,
    );
    let removed = 0;
    for (const entry of selected) {
      try {
        await deleteStoredAudio(entry.relativePath);
        revokeActiveObjectUrl(entry.relativePath);
        removed += 1;
      } catch (error) {
        console.error(`Unable to remove orphaned browser audio ${entry.relativePath}`, error);
      }
    }
    return removed;
  },

  async deleteSourceCopy(): Promise<void> {
    // Object URLs and data URLs are caller-owned; staging only retains the fetched Blob.
  },
};

export type { AudioStoreAdapter, StagedAudio } from './audioStoreTypes';
export { ImportError } from './audioStoreTypes';
export default audioStore;
