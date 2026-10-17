import type {
  Collection,
  LibraryRecord,
  MusicItem,
} from '../types/library';
import type { MigrationEntry, MigrationJournal } from '../types/migration';
import type {
  PersistedContent,
  PersistedLayer,
  ProjectIndexRecord,
  SavedProject,
  SavedProjectSummary,
  SongDraft,
} from '../types/project';
import type { PlaybackQueue } from '../types/queue';

export interface ValidationResult<T> {
  valid: T;
  invalidIds: string[];
}

const LAYER_IDS = new Set(['vocals', 'drums', 'bass', 'piano', 'guitar', 'other']);
const EXTENSIONS = new Set(['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac']);
const SORT_KEYS = new Set(['title', 'recentlyAdded', 'recentlyPlayed', 'duration']);
const MIGRATION_STATUSES = new Set([
  'pending',
  'importing',
  'migrated',
  'missing',
  'skippedNewer',
  'failedRetrying',
]);

const isRecord = (value: unknown): value is Record<string, unknown> => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);
const isString = (value: unknown): value is string => typeof value === 'string';
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isFiniteNumber = (value: unknown): value is number => (
  typeof value === 'number' && Number.isFinite(value)
);
const isNonNegativeInteger = (value: unknown): value is number => (
  Number.isInteger(value) && (value as number) >= 0
);
const isPositiveInteger = (value: unknown): value is number => (
  Number.isInteger(value) && (value as number) >= 1
);
const isStringArray = (value: unknown): value is string[] => (
  Array.isArray(value) && value.every(isString)
);
const isRelativeReference = (value: unknown): value is string => isString(value)
  && value.length > 0
  && !value.startsWith('/')
  && !value.startsWith('file:')
  && !/^[a-zA-Z]:[\\/]/.test(value)
  && !value.split(/[\\/]/).includes('..');

const isAnnotation = (value: unknown): boolean => isRecord(value)
  && isFiniteNumber(value.timestamp)
  && isString(value.text);

const isPersistedLayer = (value: unknown): value is PersistedLayer => isRecord(value)
  && isString(value.id)
  && LAYER_IDS.has(value.id)
  && isString(value.name)
  && isString(value.color)
  && Array.isArray(value.markers)
  && value.markers.every(isFiniteNumber)
  && Array.isArray(value.annotations)
  && value.annotations.every(isAnnotation)
  && isBoolean(value.isVisible);

const isRowDensity = (value: unknown): boolean => isRecord(value)
  && (value.mode === 'phrase' || value.mode === 'duration')
  && (value.phrasesPerRow === undefined || isFiniteNumber(value.phrasesPerRow))
  && (value.rowDurationMs === undefined || isFiniteNumber(value.rowDurationMs));

const isProjectSettings = (value: unknown): boolean => {
  if (!isRecord(value)
    || (value.viewMode !== 'unified' && value.viewMode !== 'multitrack')
    || !isBoolean(value.showGridLines)
    || !isBoolean(value.layerSpecificNavigation)) return false;
  if (value.primaryView !== undefined
    && value.primaryView !== 'wrapped'
    && value.primaryView !== 'detail') return false;
  if (value.countSize !== undefined
    && value.countSize !== 4
    && value.countSize !== 6
    && value.countSize !== 8) return false;
  if (value.rowDensity !== undefined && !isRowDensity(value.rowDensity)) return false;
  if (value.followPlayhead !== undefined && !isBoolean(value.followPlayhead)) return false;
  if (value.playbackSpeed !== undefined && !isFiniteNumber(value.playbackSpeed)) return false;
  if (value.loopEnabled !== undefined && !isBoolean(value.loopEnabled)) return false;
  if (value.loopRange !== undefined && value.loopRange !== null) {
    if (!isRecord(value.loopRange)
      || !isFiniteNumber(value.loopRange.startMs)
      || !isFiniteNumber(value.loopRange.endMs)) return false;
  }
  return true;
};

const hasAllLayersOnce = (layers: PersistedLayer[]): boolean => layers.length === LAYER_IDS.size
  && new Set(layers.map(layer => layer.id)).size === LAYER_IDS.size;

const isPersistedContent = (value: unknown): value is PersistedContent => {
  if (!isRecord(value)
    || !Array.isArray(value.layers)
    || !value.layers.every(isPersistedLayer)
    || !hasAllLayersOnce(value.layers)
    || !isFiniteNumber(value.bpm)
    || (value.stemCount !== 2 && value.stemCount !== 4 && value.stemCount !== 6)
    || !isProjectSettings(value.settings)
    || !isRecord(value.extras)) return false;
  return true;
};

const isProjectMetadata = (value: unknown): boolean => isRecord(value)
  && isString(value.name)
  && isFiniteNumber(value.bpm)
  && isFiniteNumber(value.duration)
  && (value.stemCount === 2 || value.stemCount === 4 || value.stemCount === 6)
  && isString(value.createdAt)
  && isString(value.modifiedAt);

const isAudioMetadata = (value: unknown): boolean => isRecord(value)
  && isString(value.uri)
  && isString(value.filename);

const isCollection = (value: unknown): value is Collection => isRecord(value)
  && isString(value.id)
  && isString(value.name)
  && isBoolean(value.builtIn);

const isSavedProjectSummary = (value: unknown): value is SavedProjectSummary => isRecord(value)
  && isString(value.projectId)
  && isString(value.musicItemId)
  && isString(value.name)
  && isPositiveInteger(value.revision)
  && isString(value.modifiedAt)
  && isNonNegativeInteger(value.markerCount)
  && isString(value.version)
  && isBoolean(value.readOnly);

const isMigrationEntry = (value: unknown): value is MigrationEntry => isRecord(value)
  && isString(value.legacyKey)
  && isString(value.status)
  && MIGRATION_STATUSES.has(value.status)
  && isString(value.projectId)
  && (value.musicItemId === null || isString(value.musicItemId))
  && (value.stagedRelativePath === null || isString(value.stagedRelativePath))
  && isNonNegativeInteger(value.attempts)
  && (value.lastError === null || isString(value.lastError));

/** Return whether a parsed value has the complete MusicItem shape. */
export function isMusicItem(value: unknown): value is MusicItem {
  if (!isRecord(value)
    || !isString(value.id)
    || !isRecord(value.source)
    || value.source.provider !== 'local'
    || !isRelativeReference(value.source.reference)
    || !isString(value.displayTitle)
    || !isString(value.originalFilename)
    || !isString(value.extension)
    || !EXTENSIONS.has(value.extension)
    || !isPositiveInteger(value.byteSize)
    || (value.contentHash !== null && !isString(value.contentHash))
    || (value.durationMs !== null && !isNonNegativeInteger(value.durationMs))
    || !isString(value.addedAt)
    || (value.lastPlayedAt !== null && !isString(value.lastPlayedAt))
    || (value.availability !== 'available' && value.availability !== 'missing')
    || !isBoolean(value.removed)
    || !isStringArray(value.collectionIds)) return false;
  if (value.legacy !== undefined) {
    if (!isRecord(value.legacy)
      || !isString(value.legacy.filename)
      || (value.legacy.durationMs !== null && !isNonNegativeInteger(value.legacy.durationMs))) {
      return false;
    }
  }
  return true;
}

/** Return whether a parsed value has the complete SavedProject shape. */
export function isSavedProject(value: unknown): value is SavedProject {
  return isRecord(value)
    && isString(value.version)
    && isString(value.projectId)
    && isString(value.musicItemId)
    && isPositiveInteger(value.revision)
    && isProjectMetadata(value.metadata)
    && isAudioMetadata(value.audio)
    && Array.isArray(value.layers)
    && value.layers.every(isPersistedLayer)
    && hasAllLayersOnce(value.layers)
    && isProjectSettings(value.settings);
}

/** Return whether a parsed value has the complete SongDraft shape. */
export function isSongDraft(value: unknown): value is SongDraft {
  if (!isRecord(value)
    || value.schemaVersion !== 1
    || !isString(value.musicItemId)
    || (value.baselineFingerprint !== null && !isString(value.baselineFingerprint))
    || !isPersistedContent(value.content)
    || !isString(value.updatedAt)) return false;
  return value.baseline === null || (
    isRecord(value.baseline)
    && isString(value.baseline.projectId)
    && isPositiveInteger(value.baseline.revision)
  );
}

/** Return whether a parsed value is a self-consistent PlaybackQueue. */
export function isPlaybackQueue(value: unknown): value is PlaybackQueue {
  if (!isRecord(value)
    || value.schemaVersion !== 1
    || !isStringArray(value.snapshot)
    || !isStringArray(value.order)
    || (value.currentIndex !== null && !isNonNegativeInteger(value.currentIndex))
    || !isBoolean(value.shuffle)
    || !isString(value.collectionId)
    || !isString(value.sortKey)
    || !SORT_KEYS.has(value.sortKey)) return false;
  if (value.currentIndex !== null && value.currentIndex >= value.order.length) return false;
  const snapshot = [...value.snapshot].sort();
  const order = [...value.order].sort();
  return snapshot.length === order.length
    && new Set(snapshot).size === snapshot.length
    && snapshot.every((id, index) => id === order[index]);
}

/** Validate one parsed library record while isolating malformed items and collections. */
export function validateLibraryRecord(value: unknown): ValidationResult<LibraryRecord | null> {
  if (!isRecord(value)
    || value.schemaVersion !== 1
    || !isRecord(value.items)
    || !isRecord(value.collections)) {
    return { valid: null, invalidIds: ['library'] };
  }
  const invalidIds: string[] = [];
  const items: Record<string, MusicItem> = {};
  Object.entries(value.items).forEach(([id, candidate]) => {
    if (isMusicItem(candidate) && candidate.id === id) items[id] = candidate;
    else invalidIds.push(id);
  });
  const collections: Record<string, Collection> = {};
  Object.entries(value.collections).forEach(([id, candidate]) => {
    if (isCollection(candidate) && candidate.id === id) collections[id] = candidate;
    else invalidIds.push(id);
  });
  return {
    valid: { schemaVersion: 1, items, collections },
    invalidIds: [...new Set(invalidIds)],
  };
}

/** Return whether a parsed value is a complete library record with no invalid children. */
export function isLibraryRecord(value: unknown): value is LibraryRecord {
  const result = validateLibraryRecord(value);
  return result.valid !== null && result.invalidIds.length === 0;
}

/** Validate a parsed SavedProject value and identify its storage ID on failure. */
export function validateSavedProject(
  value: unknown,
  id: string,
): ValidationResult<SavedProject | null> {
  return isSavedProject(value) && value.projectId === id
    ? { valid: value, invalidIds: [] }
    : { valid: null, invalidIds: [id] };
}

/** Validate a parsed SongDraft value and identify its music ID on failure. */
export function validateSongDraft(
  value: unknown,
  id: string,
): ValidationResult<SongDraft | null> {
  return isSongDraft(value) && value.musicItemId === id
    ? { valid: value, invalidIds: [] }
    : { valid: null, invalidIds: [id] };
}

/** Validate a parsed queue and report the singleton queue family on failure. */
export function validatePlaybackQueue(
  value: unknown,
): ValidationResult<PlaybackQueue | null> {
  return isPlaybackQueue(value)
    ? { valid: value, invalidIds: [] }
    : { valid: null, invalidIds: ['queue'] };
}

/** Validate an index while retaining every independently valid project summary. */
export function validateProjectIndexRecord(
  value: unknown,
): ValidationResult<ProjectIndexRecord | null> {
  if (!isRecord(value) || value.schemaVersion !== 1 || !isRecord(value.projects)) {
    return { valid: null, invalidIds: ['project-index'] };
  }
  const projects: Record<string, SavedProjectSummary> = {};
  const invalidIds: string[] = [];
  Object.entries(value.projects).forEach(([id, candidate]) => {
    if (isSavedProjectSummary(candidate) && candidate.projectId === id) projects[id] = candidate;
    else invalidIds.push(id);
  });
  return { valid: { schemaVersion: 1, projects }, invalidIds };
}

/** Return whether a parsed value is a complete project index with no invalid children. */
export function isProjectIndexRecord(value: unknown): value is ProjectIndexRecord {
  const result = validateProjectIndexRecord(value);
  return result.valid !== null && result.invalidIds.length === 0;
}

/** Validate a migration journal while retaining every independently valid entry. */
export function validateMigrationJournal(
  value: unknown,
): ValidationResult<MigrationJournal | null> {
  if (!isRecord(value)
    || value.schemaVersion !== 1
    || value.migrationVersion !== 1
    || (value.state !== 'running' && value.state !== 'complete')
    || !isString(value.startedAt)
    || !isRecord(value.entries)
    || !isNonNegativeInteger(value.unresolvedCount)) {
    return { valid: null, invalidIds: ['migration'] };
  }
  const entries: Record<string, MigrationEntry> = {};
  const invalidIds: string[] = [];
  Object.entries(value.entries).forEach(([id, candidate]) => {
    if (isMigrationEntry(candidate) && candidate.legacyKey === id) entries[id] = candidate;
    else invalidIds.push(id);
  });
  return {
    valid: {
      schemaVersion: 1,
      migrationVersion: 1,
      state: value.state,
      startedAt: value.startedAt,
      entries,
      unresolvedCount: value.unresolvedCount,
    },
    invalidIds,
  };
}

/** Return whether a parsed value is a complete migration journal with no invalid entries. */
export function isMigrationJournal(value: unknown): value is MigrationJournal {
  const result = validateMigrationJournal(value);
  return result.valid !== null && result.invalidIds.length === 0;
}
