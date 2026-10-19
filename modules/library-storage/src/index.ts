import { requireNativeModule } from 'expo-modules-core';

export interface LibraryStorageModule {
  /** Return the absolute file URI of the app-owned music directory, creating it if absent. */
  getMusicDirectoryUri(): string;
  /** Set or clear the iOS backup-exclusion flag. Android storage is excluded by location. */
  setExcludedFromBackup(uri: string, excluded: boolean): Promise<void>;
  /** Return whether the supplied app-owned path is excluded from device backup. */
  isExcludedFromBackup(uri: string): Promise<boolean>;
  /** Stream a file into an MD5 digest and return lowercase hexadecimal. */
  md5File(uri: string): Promise<string>;
  /** Return a lowercase random UUID without relying on Hermes Web Crypto support. */
  randomUUID(): string;
}

export default requireNativeModule<LibraryStorageModule>('LibraryStorage');
