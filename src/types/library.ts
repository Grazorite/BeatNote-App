export type SourceProviderId = 'local';

export interface SourceIdentity {
  provider: SourceProviderId;
  /** Path relative to the provider's managed root. Never persist an absolute container URI. */
  reference: string;
}

export interface PlaybackCapabilities {
  exactSeeking: boolean;
  waveformAccess: boolean;
  pitchPreservingSpeed: boolean;
  offlinePlayback: boolean;
  queueControl: boolean;
  backgroundPlayback: boolean;
  repeat: boolean;
  shuffle: boolean;
}

export const IMPORTED_MUSIC_COLLECTION_ID = 'imported-music';

export interface Collection {
  id: string;
  name: string;
  builtIn: boolean;
}

export type MusicItemAvailability = 'available' | 'missing';
export type SupportedAudioExtension = 'mp3' | 'wav' | 'm4a' | 'aac' | 'ogg' | 'flac';

export interface MusicItem {
  id: string;
  source: SourceIdentity;
  displayTitle: string;
  originalFilename: string;
  extension: SupportedAudioExtension;
  byteSize: number;
  contentHash: string | null;
  durationMs: number | null;
  addedAt: string;
  lastPlayedAt: string | null;
  availability: MusicItemAvailability;
  removed: boolean;
  collectionIds: string[];
  legacy?: {
    filename: string;
    durationMs: number | null;
  };
}

export type LibrarySortKey = 'title' | 'recentlyAdded' | 'recentlyPlayed' | 'duration';

export interface LibraryRecord {
  schemaVersion: 1;
  items: Record<string, MusicItem>;
  collections: Record<string, Collection>;
}

export interface LibraryPrefs {
  schemaVersion: 1;
  sort: LibrarySortKey;
  missingAudioNoticeShownForMigration: number | null;
}

export type ImportJobOrigin = 'picker' | 'openIn' | 'relink' | 'migration';
export type ImportJobStatus = 'queued' | 'validating' | 'copying' | 'hashing' | 'probing'
  | 'committing' | 'failed';

/** Session-only projection rendered by the library import progress row. */
export interface ImportJobView {
  id: string;
  origin: ImportJobOrigin;
  originalFilename: string;
  status: ImportJobStatus;
  progress: number | null;
  cancellable: boolean;
  error: string | null;
}
