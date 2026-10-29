import { requireNativeModule, type EventSubscription } from 'expo-modules-core';

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
  /** Consume file URLs delivered before JavaScript subscribed. */
  consumePendingOpenURLs(): string[];
  /** Return the cache-purge XCTest flag in development builds only. */
  shouldPurgeTestCaches(): boolean;
  /** Enable or disable native os_signpost intervals. Disabled by default. */
  enableSignposts(enabled: boolean): void;
  /** Begin a named native signpost interval keyed by interval id. No-op when disabled. */
  beginSignpost(intervalID: string, name: string): void;
  /** End a previously begun signpost interval, if any is active for this id. No-op when disabled. */
  endSignpost(intervalID: string): void;
  /** Subscribe to file URLs delivered while the app is running. */
  addListener(eventName: 'onOpenURL', listener: (event: { url: string }) => void): EventSubscription;
}

/** Resolve the LibraryStorage native module for native-side signpost wiring. */
export function requireLibraryStorageModule(): LibraryStorageModule {
  return requireNativeModule<LibraryStorageModule>('LibraryStorage');
}

export default requireNativeModule<LibraryStorageModule>('LibraryStorage');
