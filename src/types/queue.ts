import type { LibrarySortKey } from './library';

export interface PlaybackQueue {
  schemaVersion: 1;
  snapshot: string[];
  order: string[];
  currentIndex: number | null;
  shuffle: boolean;
  collectionId: string;
  sortKey: LibrarySortKey;
}
