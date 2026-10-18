import {
  IMPORTED_MUSIC_COLLECTION_ID,
  type LibraryPrefs,
  type LibraryRecord,
  type MusicItem,
  type SupportedAudioExtension,
} from '../../types/library';
import type { MigrationEntry, MigrationJournal } from '../../types/migration';
import {
  SAVED_PROJECT_VERSION,
  type BeatNoteProject,
  type LegacyStoredProject,
} from '../../types/project';
import {
  MIGRATION_IMPORT_ATTEMPT_LIMIT,
  SUPPORTED_AUDIO_EXTENSIONS,
} from '../../utils/libraryConstants';
import {
  classifyLegacyUri,
  findMissingItemMatch,
  toSavedProject,
  type LegacyFileInfo,
  type MigrationPlatform,
} from '../../utils/migrationPlan';
import { isBeatNoteProject } from '../../utils/recordValidation';
import { compareProjectVersion } from '../../utils/projectManager';
import {
  readLegacyProjects,
  readLibraryStrict,
  readMigrationJournalStrict,
  writeLibrary,
  writeLibraryPrefs,
  writeMigrationJournal,
  writeProject,
  type RepositoryOptions,
} from './repositories';

const MIGRATION_VERSION = 1;
const DEFAULT_MISSING_EXTENSION: SupportedAudioExtension = 'mp3';

export interface MigrationImportRequest {
  origin: 'migration';
  sourceUri: string;
  originalFilename: string;
  reportedBytes: number | null;
  onStaged: (relativePath: string) => Promise<void>;
  onCommitted: (musicItemId: string) => Promise<void>;
}

export type MigrationImportOutcome =
  | { kind: 'imported'; musicItemId: string }
  | { kind: 'failed'; error: unknown };

export interface MigrationDependencies {
  platform: MigrationPlatform;
  randomUUID: () => string;
  inspectLegacyFile: (sourceUri: string) => Promise<LegacyFileInfo | null>;
  importer: (request: MigrationImportRequest) => Promise<MigrationImportOutcome>;
  /** Remove a staged path, resolving successfully when it is already absent. */
  discardStaged: (relativePath: string) => Promise<void>;
  now?: () => Date;
  repositoryOptions?: RepositoryOptions;
  onStatus?: (status: MigrationRunStatus) => void;
}

export type MigrationRunStatus = 'running' | 'needsRetry' | 'complete';

export interface ReadOnlyLegacyProjectSummary {
  legacyKey: string;
  projectId: string;
  name: string;
  modifiedAt: string;
  markerCount: number;
  version: string;
  readOnly: true;
}

export interface MigrationRunResult {
  status: MigrationRunStatus;
  journal: MigrationJournal;
  unresolvedNoticeCount: number | null;
  readOnlyProjects: ReadOnlyLegacyProjectSummary[];
}

const emptyLibrary = (): LibraryRecord => ({
  schemaVersion: 1,
  items: {},
  collections: {
    [IMPORTED_MUSIC_COLLECTION_ID]: {
      id: IMPORTED_MUSIC_COLLECTION_ID,
      name: 'Imported Music',
      builtIn: true,
    },
  },
});

const initialJournal = (now: Date): MigrationJournal => ({
  schemaVersion: 1,
  migrationVersion: MIGRATION_VERSION,
  state: 'running',
  startedAt: now.toISOString(),
  entries: {},
  unresolvedCount: 0,
});

const initialEntry = (legacyKey: string, projectId: string): MigrationEntry => ({
  legacyKey,
  status: 'pending',
  projectId,
  musicItemId: null,
  stagedRelativePath: null,
  attempts: 0,
  lastError: null,
});

const isTerminal = (entry: MigrationEntry): boolean => (
  entry.status === 'migrated'
  || entry.status === 'missing'
  || entry.status === 'skippedNewer'
);

const unresolvedCount = (journal: MigrationJournal): number => (
  Object.values(journal.entries).filter(entry => entry.status === 'missing').length
);

const snapshotJournal = (journal: MigrationJournal): MigrationJournal => ({
  ...journal,
  entries: Object.fromEntries(Object.entries(journal.entries).map(([key, entry]) => (
    [key, { ...entry }]
  ))),
});

const errorMessage = (error: unknown): string => (
  error instanceof Error ? error.message : String(error)
);

const filenameExtension = (filename: string): SupportedAudioExtension => {
  const extension = filename.slice(filename.lastIndexOf('.')).toLocaleLowerCase('en-US');
  const match = SUPPORTED_AUDIO_EXTENSIONS.find(candidate => candidate === extension);
  return match ? match.slice(1) as SupportedAudioExtension : DEFAULT_MISSING_EXTENSION;
};

const displayTitle = (filename: string): string => {
  const finalDot = filename.lastIndexOf('.');
  const title = finalDot > 0 ? filename.slice(0, finalDot) : filename;
  return title || filename || 'Audio missing';
};

const legacyDuration = (project: BeatNoteProject): number | null => (
  Number.isFinite(project.metadata.duration) && project.metadata.duration > 0
    ? Math.floor(project.metadata.duration + 0.5)
    : null
);

async function findOrCreateMissingItem(
  project: BeatNoteProject,
  entry: MigrationEntry,
  dependencies: MigrationDependencies,
  persistJournal: () => Promise<void>,
): Promise<string> {
  const options = dependencies.repositoryOptions;
  const library = await readLibraryStrict(options) ?? emptyLibrary();
  const durationMs = legacyDuration(project);
  const match = findMissingItemMatch(library, project.audio.filename, durationMs);
  if (match) {
    if (entry.musicItemId !== match.id) {
      entry.musicItemId = match.id;
      await persistJournal();
    }
    return match.id;
  }

  const id = entry.musicItemId ?? dependencies.randomUUID();
  if (entry.musicItemId === null) {
    entry.musicItemId = id;
    await persistJournal();
  }
  if (library.items[id]) return id;
  const extension = filenameExtension(project.audio.filename);
  const now = (dependencies.now ?? (() => new Date()))().toISOString();
  const item: MusicItem = {
    id,
    source: { provider: 'local', reference: `missing/${id}.${extension}` },
    displayTitle: displayTitle(project.audio.filename),
    originalFilename: project.audio.filename,
    extension,
    byteSize: 0,
    contentHash: null,
    durationMs,
    addedAt: now,
    lastPlayedAt: null,
    availability: 'missing',
    removed: false,
    collectionIds: [IMPORTED_MUSIC_COLLECTION_ID],
    legacy: { filename: project.audio.filename, durationMs },
  };
  await writeLibrary({
    schemaVersion: 1,
    items: { ...library.items, [id]: item },
    collections: {
      ...library.collections,
      [IMPORTED_MUSIC_COLLECTION_ID]: library.collections[IMPORTED_MUSIC_COLLECTION_ID]
        ?? emptyLibrary().collections[IMPORTED_MUSIC_COLLECTION_ID],
    },
  }, options);
  return id;
}

async function cleanupInterruptedStage(
  entry: MigrationEntry,
  dependencies: MigrationDependencies,
): Promise<void> {
  if (entry.stagedRelativePath === null) return;
  const library = await readLibraryStrict(dependencies.repositoryOptions) ?? emptyLibrary();
  const referenced = Object.values(library.items).some(item => (
    item.source.provider === 'local' && item.source.reference === entry.stagedRelativePath
  ));
  if (!referenced) await dependencies.discardStaged(entry.stagedRelativePath);
  entry.stagedRelativePath = null;
}

const readOnlySummaries = (
  legacy: Record<string, LegacyStoredProject>,
  journal: MigrationJournal,
): ReadOnlyLegacyProjectSummary[] => Object.values(journal.entries)
  .filter(entry => entry.status === 'skippedNewer' && legacy[entry.legacyKey] !== undefined)
  .map(entry => {
    const project = legacy[entry.legacyKey];
    return {
      legacyKey: entry.legacyKey,
      projectId: entry.projectId,
      name: project.metadata.name,
      modifiedAt: project.metadata.modifiedAt,
      markerCount: isBeatNoteProject(project)
        ? project.layers.reduce((count, layer) => count + layer.markers.length, 0)
        : 0,
      version: project.version,
      readOnly: true as const,
    };
  });

export const migrationNoticeCount = (
  journal: Pick<MigrationJournal, 'migrationVersion' | 'unresolvedCount' | 'state'>,
  prefs: LibraryPrefs | null,
): number | null => (
  journal.state === 'complete'
    && journal.unresolvedCount > 0
    && prefs?.missingAudioNoticeShownForMigration !== journal.migrationVersion
      ? journal.unresolvedCount
      : null
);

export async function markMigrationNoticeShown(
  prefs: LibraryPrefs | null,
  migrationVersion = MIGRATION_VERSION,
  options?: RepositoryOptions,
): Promise<void> {
  await writeLibraryPrefs({
    schemaVersion: 1,
    sort: prefs?.sort ?? 'recentlyAdded',
    missingAudioNoticeShownForMigration: migrationVersion,
  }, options);
}

/** Migrate the frozen legacy project snapshot through resumable, journaled steps. */
export async function runMigration(
  dependencies: MigrationDependencies,
  prefs: LibraryPrefs | null = null,
): Promise<MigrationRunResult> {
  const options = dependencies.repositoryOptions;
  dependencies.onStatus?.('running');
  const legacy = await readLegacyProjects(options) ?? {};
  const journal = await readMigrationJournalStrict(options)
    ?? initialJournal((dependencies.now ?? (() => new Date()))());

  const persistJournal = async (): Promise<void> => {
    journal.unresolvedCount = unresolvedCount(journal);
    await writeMigrationJournal(snapshotJournal(journal), options);
  };

  for (const legacyKey of Object.keys(legacy).sort()) {
    const project = legacy[legacyKey];
    let entry = journal.entries[legacyKey];
    if (!entry) {
      entry = initialEntry(legacyKey, dependencies.randomUUID());
      journal.entries[legacyKey] = entry;
      await persistJournal();
    }
    if (isTerminal(entry)) continue;

    let musicItemId: string | null = null;
    if (entry.stagedRelativePath !== null) {
      await cleanupInterruptedStage(entry, dependencies);
      await persistJournal();
    }
    if (entry.status === 'importing' || entry.status === 'failedRetrying') {
      if (entry.musicItemId !== null) {
        const library = await readLibraryStrict(options) ?? emptyLibrary();
        if (library.items[entry.musicItemId]) musicItemId = entry.musicItemId;
      }
      if (musicItemId === null) {
        entry.status = 'pending';
        entry.musicItemId = null;
        await persistJournal();
      }
    }

    if (compareProjectVersion(project.version, SAVED_PROJECT_VERSION) > 0) {
      entry.status = 'skippedNewer';
      entry.lastError = null;
      await persistJournal();
      continue;
    }
    if (!isBeatNoteProject(project)) {
      throw new Error(`Legacy project ${legacyKey} is not valid for migration`);
    }

    let fileInfo: LegacyFileInfo | null = null;
    if (musicItemId === null && project.audio.uri.startsWith('file:')) {
      try {
        fileInfo = await dependencies.inspectLegacyFile(project.audio.uri);
      } catch (error) {
        console.warn('Unable to inspect legacy audio; migrating it as missing', error);
      }
    }
    const uriClass = classifyLegacyUri(project.audio.uri, dependencies.platform, fileInfo);
    const importable = musicItemId === null && (
      uriClass === 'durableFile'
      || uriClass === 'liveCache'
      || uriClass === 'inlineData'
    );

    if (importable && entry.attempts < MIGRATION_IMPORT_ATTEMPT_LIMIT) {
      entry.status = 'importing';
      entry.attempts += 1;
      entry.lastError = null;
      await persistJournal();
      let outcome: MigrationImportOutcome;
      try {
        outcome = await dependencies.importer({
          origin: 'migration',
          sourceUri: project.audio.uri,
          originalFilename: project.audio.filename,
          reportedBytes: fileInfo?.size ?? null,
          onStaged: async relativePath => {
            entry.stagedRelativePath = relativePath;
            await persistJournal();
          },
          onCommitted: async committedMusicItemId => {
            musicItemId = committedMusicItemId;
            entry.musicItemId = committedMusicItemId;
            await persistJournal();
          },
        });
      } catch (error) {
        outcome = { kind: 'failed', error };
      }
      if (outcome.kind === 'imported') {
        musicItemId = outcome.musicItemId;
        if (entry.musicItemId !== musicItemId) {
          entry.musicItemId = musicItemId;
          await persistJournal();
        }
      } else if (musicItemId === null) {
        entry.lastError = errorMessage(outcome.error);
        if (entry.attempts < MIGRATION_IMPORT_ATTEMPT_LIMIT) {
          entry.status = 'failedRetrying';
          await persistJournal();
          continue;
        }
        await cleanupInterruptedStage(entry, dependencies);
      }
    }

    const migratedMissing = musicItemId === null;
    if (migratedMissing) {
      musicItemId = await findOrCreateMissingItem(
        project,
        entry,
        dependencies,
        persistJournal,
      );
    }
    const resolvedMusicItemId = musicItemId;
    if (resolvedMusicItemId === null) throw new Error('Migration did not resolve a music item');
    await writeProject(toSavedProject(project, entry.projectId, resolvedMusicItemId), options);
    entry.musicItemId = resolvedMusicItemId;
    entry.stagedRelativePath = null;
    entry.lastError = null;
    entry.status = migratedMissing ? 'missing' : 'migrated';
    await persistJournal();
  }

  const needsRetry = Object.values(journal.entries).some(entry => !isTerminal(entry));
  journal.state = needsRetry ? 'running' : 'complete';
  await persistJournal();
  const status: MigrationRunStatus = needsRetry ? 'needsRetry' : 'complete';
  dependencies.onStatus?.(status);
  return {
    status,
    journal: snapshotJournal(journal),
    unresolvedNoticeCount: migrationNoticeCount(journal, prefs),
    readOnlyProjects: readOnlySummaries(legacy, journal),
  };
}
