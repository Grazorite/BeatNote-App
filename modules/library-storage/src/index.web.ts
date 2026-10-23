import type { EventSubscription } from 'expo-modules-core';
import type { LibraryStorageModule } from './index';

const unsupported = (operation: string): never => {
  throw new Error(`LibraryStorage.${operation} is unavailable on web`);
};

const LibraryStorageWeb: LibraryStorageModule = {
  getMusicDirectoryUri: () => unsupported('getMusicDirectoryUri'),
  setExcludedFromBackup: async () => unsupported('setExcludedFromBackup'),
  isExcludedFromBackup: async () => unsupported('isExcludedFromBackup'),
  md5File: async () => unsupported('md5File'),
  randomUUID: () => crypto.randomUUID().toLocaleLowerCase('en-US'),
  consumePendingOpenURLs: () => [],
  addListener: () => ({ remove: () => undefined }) as EventSubscription,
};

export default LibraryStorageWeb;
