import { createAudioPlayer } from 'expo-audio';
import { Directory, File, Paths } from 'expo-file-system';
import { copyAsync } from 'expo-file-system/legacy';

import LibraryStorage from '../../../modules/library-storage/src';
import type { SupportedAudioExtension } from '../../types/library';
import { selectOrphans, type StoredFileEntry } from '../../utils/importDecisions';
import type { AudioStoreAdapter, StagedAudio } from './audioStoreTypes';
import { ImportError } from './audioStoreTypes';

interface NativeStoredFile extends StoredFileEntry {
  file: File;
}

const POLL_INTERVAL_MS = 100;

const delay = (milliseconds: number): Promise<void> => new Promise(resolve => {
  setTimeout(resolve, milliseconds);
});

const musicDirectory = (): Directory => new Directory(LibraryStorage.getMusicDirectoryUri());
const stagingDirectory = (): Directory => new Directory(musicDirectory(), '.staging');
const managedFile = (relativePath: string): File => new File(musicDirectory(), relativePath);
const stagedFile = (staged: StagedAudio): File => managedFile(staged.stagingRef);

const probePlayableDuration = async (uri: string, timeoutMs: number): Promise<number> => {
  const player = createAudioPlayer({ uri });
  const deadline = Date.now() + timeoutMs;
  try {
    while (Date.now() < deadline) {
      if (player.isLoaded && Number.isFinite(player.duration) && player.duration > 0) {
        return player.duration * 1_000;
      }
      await delay(POLL_INTERVAL_MS);
    }
    throw new ImportError('decodeTimeout', 'Timed out while reading the audio duration');
  } finally {
    player.release();
  }
};

const removeIfPresent = (file: File): void => {
  if (!file.exists) return;
  try {
    file.delete();
  } catch (error) {
    if (file.exists) throw error;
  }
};

const isDescendantUri = (candidate: string, root: string): boolean => {
  try {
    const candidateUrl = new URL(candidate);
    const rootUrl = new URL(root);
    const rootPath = decodeURIComponent(rootUrl.pathname).replace(/\/?$/, '/');
    return candidateUrl.protocol === rootUrl.protocol
      && candidateUrl.host === rootUrl.host
      && decodeURIComponent(candidateUrl.pathname).startsWith(rootPath);
  } catch {
    return false;
  }
};

const listStoredFiles = (): NativeStoredFile[] => {
  const root = musicDirectory();
  const staging = stagingDirectory();
  const rootFiles = root.list()
    .filter((entry): entry is File => entry instanceof File)
    .map(file => ({
      file,
      relativePath: file.name,
      modifiedAtMs: file.modificationTime ?? Number.NaN,
    }));
  const stagedFiles = staging.list()
    .filter((entry): entry is File => entry instanceof File)
    .map(file => ({
      file,
      relativePath: `.staging/${file.name}`,
      modifiedAtMs: file.modificationTime ?? Number.NaN,
    }));
  return [...rootFiles, ...stagedFiles];
};

export const audioStore: AudioStoreAdapter = {
  async ensureDirectories(): Promise<void> {
    const root = musicDirectory();
    root.create({ idempotent: true, intermediates: true });
    stagingDirectory().create({ idempotent: true, intermediates: true });
    try {
      if (!await LibraryStorage.isExcludedFromBackup(root.uri)) {
        await LibraryStorage.setExcludedFromBackup(root.uri, true);
      }
    } catch (error) {
      console.error('Unable to apply the music backup-exclusion policy', error);
    }
  },

  async availableBytes(): Promise<number | null> {
    try {
      const available = Paths.availableDiskSpace;
      return Number.isFinite(available) && available >= 0 ? available : null;
    } catch {
      return null;
    }
  },

  async sourceByteSize(sourceUri: string): Promise<number | null> {
    try {
      const size = new File(sourceUri).info().size;
      return typeof size === 'number' && Number.isFinite(size) && size >= 0 ? size : null;
    } catch {
      return null;
    }
  },

  randomUUID(): string {
    return LibraryStorage.randomUUID();
  },

  async stage(
    sourceUri: string,
    expectedBytes: number,
    extension: SupportedAudioExtension,
  ): Promise<StagedAudio> {
    const relativePath = `.staging/${LibraryStorage.randomUUID()}.${extension}`;
    const destination = managedFile(relativePath);
    try {
      await copyAsync({ from: sourceUri, to: destination.uri });
    } catch (error) {
      removeIfPresent(destination);
      throw error;
    }
    const copiedBytes = destination.size;
    if (copiedBytes !== expectedBytes) {
      removeIfPresent(destination);
      throw new ImportError(
        'copyIncomplete',
        `Copied ${copiedBytes} of ${expectedBytes} bytes`,
      );
    }
    return { stagingRef: relativePath, byteSize: copiedBytes };
  },

  async hash(staged: StagedAudio): Promise<string> {
    return `md5:${await LibraryStorage.md5File(stagedFile(staged).uri)}`;
  },

  async probeDuration(staged: StagedAudio, timeoutMs: number): Promise<number> {
    return probePlayableDuration(stagedFile(staged).uri, timeoutMs);
  },

  probePlayableDuration,

  async commit(staged: StagedAudio, physicalName: string): Promise<string> {
    stagedFile(staged).move(managedFile(physicalName));
    return physicalName;
  },

  async discard(staged: StagedAudio): Promise<void> {
    removeIfPresent(stagedFile(staged));
  },

  async resolvePlayableUri(relativePath: string): Promise<string> {
    return managedFile(relativePath).uri;
  },

  async checkAvailable(relativePath: string): Promise<'available' | 'missing'> {
    try {
      const file = managedFile(relativePath);
      const info = file.info();
      const size = info.size ?? 0;
      return info.exists && Number.isFinite(size) && size > 0 ? 'available' : 'missing';
    } catch {
      return 'missing';
    }
  },

  async remove(relativePath: string): Promise<void> {
    removeIfPresent(managedFile(relativePath));
  },

  async sweepOrphans(referenced: ReadonlySet<string>, minAgeMs: number): Promise<number> {
    const selected = selectOrphans(listStoredFiles(), referenced, Date.now(), minAgeMs);
    let removed = 0;
    selected.forEach(entry => {
      try {
        removeIfPresent(entry.file);
        removed += 1;
      } catch (error) {
        console.error(`Unable to remove orphaned audio file ${entry.relativePath}`, error);
      }
    });
    return removed;
  },

  async deleteSourceCopy(sourceUri: string): Promise<void> {
    const inboxUri = new Directory(Paths.document, 'Inbox').uri;
    if (!isDescendantUri(sourceUri, Paths.cache.uri) && !isDescendantUri(sourceUri, inboxUri)) return;
    removeIfPresent(new File(sourceUri));
  },
};

export type { AudioStoreAdapter, StagedAudio } from './audioStoreTypes';
export { ImportError } from './audioStoreTypes';
export default audioStore;
