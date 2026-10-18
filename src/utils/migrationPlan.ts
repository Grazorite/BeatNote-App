import type { LibraryRecord, MusicItem } from '../types/library';
import type { MigrationJournal } from '../types/migration';
import {
  SAVED_PROJECT_VERSION,
  type BeatNoteProject,
  type SavedProject,
} from '../types/project';
import { LEGACY_DURATION_TOLERANCE_MS } from './libraryConstants';

export type LegacyUriClass =
  | 'durableFile'
  | 'liveCache'
  | 'purged'
  | 'sessionObjectUrl'
  | 'inlineData'
  | 'unknown';

export type MigrationPlatform = 'ios' | 'web';

export interface LegacyFileInfo {
  exists: boolean;
  size: number | null;
}

const isReadableFile = (fileInfo: LegacyFileInfo | null): boolean => (
  fileInfo?.exists === true && fileInfo.size !== null && fileInfo.size > 0
);

/** Classify a legacy playback URI without performing I/O. */
export function classifyLegacyUri(
  uri: string,
  platform: MigrationPlatform,
  fileInfo: LegacyFileInfo | null = null,
): LegacyUriClass {
  if (platform === 'web') {
    if (uri.startsWith('blob:')) return 'sessionObjectUrl';
    if (uri.startsWith('data:audio/')) return 'inlineData';
  }

  if (!uri.startsWith('file://')) return 'unknown';
  if (!isReadableFile(fileInfo)) return 'purged';
  if (/\/Library\/Caches(?:\/|$)/.test(uri)) return 'liveCache';
  if (/\/Documents(?:\/|$)/.test(uri)) return 'durableFile';
  return 'unknown';
}

/** Find an existing missing item that is safe to share between legacy projects. */
export function findMissingItemMatch(
  library: Pick<LibraryRecord, 'items'>,
  filename: string,
  durationMs: number | null,
): MusicItem | null {
  if (durationMs === null) return null;

  return Object.values(library.items).find(item => (
    item.availability === 'missing'
    && !item.removed
    && item.legacy?.filename === filename
    && item.legacy.durationMs !== null
    && Math.abs(item.legacy.durationMs - durationMs) <= LEGACY_DURATION_TOLERANCE_MS
  )) ?? null;
}

/** Wrap a legacy project in the v1.2 identity envelope without normalising its authored content. */
export function toSavedProject(
  legacy: BeatNoteProject,
  projectId: string,
  musicItemId: string,
): SavedProject {
  return {
    ...legacy,
    version: SAVED_PROJECT_VERSION,
    projectId,
    musicItemId,
    revision: 1,
    audio: { ...legacy.audio },
    layers: legacy.layers,
    settings: legacy.settings,
  };
}

const TERMINAL_MIGRATION_STATUSES = new Set([
  'migrated',
  'missing',
  'skippedNewer',
]);

/** Return the next deterministic legacy key that still needs migration work. */
export function nextMigrationStep(
  journal: Pick<MigrationJournal, 'entries'>,
  legacyKeys: readonly string[],
): string | null {
  return [...legacyKeys]
    .sort()
    .find(key => {
      const entry = journal.entries[key];
      return entry === undefined || !TERMINAL_MIGRATION_STATUSES.has(entry.status);
    }) ?? null;
}
