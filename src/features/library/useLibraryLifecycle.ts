import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';

import { useStudioStore, type StudioStore } from '../../hooks/useStudioStore';
import {
  IMPORTED_MUSIC_COLLECTION_ID,
  type LibraryPrefs,
  type LibraryRecord,
} from '../../types/library';
import type { MigrationJournal } from '../../types/migration';
import type { LegacyStoredProject, ProjectIndexRecord } from '../../types/project';
import type { PlaybackQueue } from '../../types/queue';
import { DRAFT_FLUSH_TIMEOUT_MS, ORPHAN_FILE_MIN_AGE_MS } from '../../utils/libraryConstants';
import { restoreQueue } from '../../utils/queueOrder';
import audioStore from './audioStore';
import type { AudioStoreAdapter } from './audioStoreTypes';
import { flushDraft, retryFailedDraft, startDraftAutosave } from './draftAutosave';
import { getImportJobs, migrationImporter } from './importPipeline';
import {
  migrationNoticeCount,
  readOnlyLegacyProjectSummaries,
  runMigration,
  type MigrationImportRequest,
  type MigrationImportOutcome,
  type MigrationRunResult,
} from './migration';
import type { PersistenceIssue } from './persistencePipeline';
import {
  readLegacyProjects,
  readLibrary,
  readLibraryPrefsStrict,
  readMigrationJournalStrict,
  readProjectIndex,
  readQueueStrict,
  writeLibrary,
  writeQueue,
  type RepositoryOptions,
} from './repositories';

const terminalMigrationStatuses = new Set(['migrated', 'missing', 'skippedNewer']);

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

type StoreSetState = typeof useStudioStore.setState;
type StoreGetState = typeof useStudioStore.getState;

export interface LibraryBootDependencies {
  platform: 'ios' | 'web';
  audioStore: AudioStoreAdapter;
  getState: StoreGetState;
  setState: StoreSetState;
  readLibrary: (options?: RepositoryOptions) => Promise<LibraryRecord | null>;
  readPrefs: (options?: RepositoryOptions) => Promise<LibraryPrefs | null>;
  readProjects: (options?: RepositoryOptions) => Promise<ProjectIndexRecord | null>;
  readQueue: (options?: RepositoryOptions) => Promise<PlaybackQueue | null>;
  readJournal: (options?: RepositoryOptions) => Promise<MigrationJournal | null>;
  readLegacy: (options?: RepositoryOptions) => Promise<Record<string, LegacyStoredProject> | null>;
  writeLibrary: (library: LibraryRecord, options?: RepositoryOptions) => Promise<void>;
  writeQueue: (queue: PlaybackQueue | null, options?: RepositoryOptions) => Promise<void>;
  runMigration: typeof runMigration;
  migrationImporter: (request: MigrationImportRequest) => Promise<MigrationImportOutcome>;
  getImportJobs: typeof getImportJobs;
  logInfo: (...values: unknown[]) => void;
  logError: (...values: unknown[]) => void;
}

const defaultDependencies: LibraryBootDependencies = {
  platform: Platform.OS === 'web' ? 'web' : 'ios',
  audioStore,
  getState: useStudioStore.getState,
  setState: useStudioStore.setState,
  readLibrary,
  readPrefs: readLibraryPrefsStrict,
  readProjects: readProjectIndex,
  readQueue: readQueueStrict,
  readJournal: readMigrationJournalStrict,
  readLegacy: readLegacyProjects,
  writeLibrary,
  writeQueue,
  runMigration,
  migrationImporter,
  getImportJobs,
  logInfo: console.info,
  logError: console.error,
};

const upsertIssue = (
  dependencies: LibraryBootDependencies,
  issue: PersistenceIssue,
): void => {
  dependencies.setState((state: StudioStore) => ({
    persistenceIssues: [
      ...state.persistenceIssues.filter(existing => (
        existing.kind !== issue.kind || existing.label !== issue.label
      )),
      issue,
    ],
  }));
};

const needsMigration = (
  legacy: Record<string, LegacyStoredProject>,
  journal: MigrationJournal | null,
): boolean => {
  const keys = Object.keys(legacy);
  if (keys.length === 0) return false;
  if (journal === null || journal.state === 'running') return true;
  return keys.some(key => {
    const status = journal.entries[key]?.status;
    return status === undefined || !terminalMigrationStatuses.has(status);
  });
};

const sameRecord = (left: unknown, right: unknown): boolean => (
  JSON.stringify(left) === JSON.stringify(right)
);

/** Run launch hydration without React so its ordering and failure behavior can be checked directly. */
export async function runLibraryBoot(
  dependencies: LibraryBootDependencies = defaultDependencies,
): Promise<void> {
  dependencies.setState({ libraryStatus: 'booting' });
  let fatalReadFailure = false;
  const repositoryOptions: RepositoryOptions = {
    availableBytes: dependencies.audioStore.availableBytes,
    onIssue: issue => {
      if (issue.kind === 'readFailed') fatalReadFailure = true;
      upsertIssue(dependencies, {
        ...issue,
        retry: async () => { await runLibraryBoot(dependencies); },
      });
    },
  };

  let library: LibraryRecord;
  let prefs: LibraryPrefs | null;
  let projects: ProjectIndexRecord;
  let queue: PlaybackQueue | null;
  let journal: MigrationJournal | null;
  let legacy: Record<string, LegacyStoredProject>;

  try {
    library = await dependencies.readLibrary(repositoryOptions) ?? emptyLibrary();
    if (fatalReadFailure) throw new Error('Library read failed');
    prefs = await dependencies.readPrefs(repositoryOptions);
    if (fatalReadFailure) throw new Error('Library preferences read failed');
    queue = await dependencies.readQueue(repositoryOptions);
    if (fatalReadFailure) throw new Error('Playback queue read failed');
    journal = await dependencies.readJournal(repositoryOptions);
    if (fatalReadFailure) throw new Error('Migration journal read failed');
    legacy = await dependencies.readLegacy(repositoryOptions) ?? {};
    if (fatalReadFailure) throw new Error('Legacy projects read failed');
    const projectIndex = await dependencies.readProjects(repositoryOptions);
    if (projectIndex === null) fatalReadFailure = true;
    projects = projectIndex ?? { schemaVersion: 1, projects: {} };
  } catch (error) {
    fatalReadFailure = true;
    if (!dependencies.getState().persistenceIssues.some(issue => issue.kind === 'readFailed')) {
      upsertIssue(dependencies, {
        kind: 'readFailed',
        label: 'library data',
        message: "BeatNote couldn't read library data",
        error,
        retry: async () => { await runLibraryBoot(dependencies); },
      });
    }
    dependencies.setState({ libraryStatus: 'readError' });
    return;
  }

  if (fatalReadFailure) {
    dependencies.setState({ libraryStatus: 'readError' });
    return;
  }

  let readOnlyLegacyProjects = readOnlyLegacyProjectSummaries(
    legacy,
    journal ?? { schemaVersion: 1, migrationVersion: 1, state: 'running', startedAt: '', entries: {}, unresolvedCount: 0 },
  );
  let unresolvedCount = journal === null ? null : migrationNoticeCount(journal, prefs);

  if (needsMigration(legacy, journal)) {
    dependencies.setState({ libraryStatus: 'migrating' });
    let migration: MigrationRunResult;
    try {
      migration = await dependencies.runMigration({
        platform: dependencies.platform,
        randomUUID: dependencies.audioStore.randomUUID,
        inspectLegacyFile: async sourceUri => {
          const size = await dependencies.audioStore.sourceByteSize(sourceUri);
          return size === null ? null : { exists: true, size };
        },
        importer: dependencies.migrationImporter,
        discardStaged: relativePath => dependencies.audioStore.discard({
          stagingRef: relativePath,
          byteSize: 0,
        }),
        repositoryOptions,
      }, prefs);
      readOnlyLegacyProjects = migration.readOnlyProjects;
      unresolvedCount = migration.unresolvedNoticeCount;

      library = await dependencies.readLibrary(repositoryOptions) ?? emptyLibrary();
      if (fatalReadFailure) {
        dependencies.setState({ libraryStatus: 'readError' });
        return;
      }
      const refreshedProjects = await dependencies.readProjects(repositoryOptions);
      if (fatalReadFailure || refreshedProjects === null) {
        dependencies.setState({ libraryStatus: 'readError' });
        return;
      }
      projects = refreshedProjects;
    } catch (error) {
      dependencies.logError('Unable to finish library migration', error);
      upsertIssue(dependencies, {
        kind: 'readFailed',
        label: 'library migration',
        message: "BeatNote couldn't update your library",
        error,
        retry: async () => { await runLibraryBoot(dependencies); },
      });
      dependencies.setState({ libraryStatus: 'readError' });
      return;
    }
  }

  try {
    await dependencies.audioStore.ensureDirectories();
  } catch (error) {
    upsertIssue(dependencies, {
      kind: 'readFailed',
      label: 'music storage',
      message: "BeatNote couldn't read music storage",
      error,
      retry: async () => { await runLibraryBoot(dependencies); },
    });
    dependencies.setState({ libraryStatus: 'readError' });
    return;
  }

  let availabilityChanged = false;
  const reconciledItems = { ...library.items };
  for (const item of Object.values(library.items)) {
    if (item.source.provider !== 'local') continue;
    const availability = await dependencies.audioStore.checkAvailable(item.source.reference);
    if (availability === item.availability) continue;
    availabilityChanged = true;
    reconciledItems[item.id] = { ...item, availability };
  }
  if (availabilityChanged) {
    library = { ...library, items: reconciledItems };
    try {
      await dependencies.writeLibrary(library, repositoryOptions);
    } catch {
      // The repository surfaced the persistent issue; the in-memory mirror intentionally remains.
    }
  }

  const existingIds = Object.values(library.items)
    .filter(item => !item.removed)
    .map(item => item.id);
  const restoredQueue = queue === null ? null : restoreQueue(queue, existingIds);
  if (!sameRecord(queue, restoredQueue)) {
    try {
      await dependencies.writeQueue(restoredQueue, repositoryOptions);
    } catch {
      // The repository surfaced the persistent issue; the in-memory mirror intentionally remains.
    }
  }

  dependencies.setState((state: StudioStore) => ({
    libraryItems: library.items,
    librarySort: prefs?.sort ?? 'recentlyAdded',
    projectSummaries: projects.projects,
    readOnlyLegacyProjects,
    migrationNoticeCount: unresolvedCount,
    queue: restoredQueue,
    libraryStatus: 'ready',
    persistenceIssues: state.persistenceIssues.filter(issue => issue.kind !== 'readFailed'),
  }));
}

export async function runOrphanSweep(
  dependencies: LibraryBootDependencies = defaultDependencies,
): Promise<boolean> {
  if (dependencies.getImportJobs().some(job => job.status !== 'failed')) return false;
  const referenced = new Set(
    Object.values(dependencies.getState().libraryItems)
      .filter(item => item.source.provider === 'local')
      .map(item => item.source.reference),
  );
  try {
    const removed = await dependencies.audioStore.sweepOrphans(
      referenced,
      ORPHAN_FILE_MIN_AGE_MS,
    );
    dependencies.logInfo(`Removed ${removed} orphaned audio file${removed === 1 ? '' : 's'}`);
  } catch (error) {
    dependencies.logError('Unable to sweep orphaned audio files', error);
  }
  return true;
}

/** Mount once at the studio root. Later lifecycle tasks extend this hook with AppState and Open_In. */
export function useLibraryLifecycle(): void {
  const libraryStatus = useStudioStore(state => state.libraryStatus);
  const importJobs = useStudioStore(state => state.importJobs);
  const bootStarted = useRef(false);
  const orphanSweepStarted = useRef(false);
  const orphanSweepInFlight = useRef(false);

  useEffect(() => {
    if (bootStarted.current) return;
    bootStarted.current = true;
    void runLibraryBoot();
  }, []);

  useEffect(() => {
    if (libraryStatus !== 'ready' || orphanSweepStarted.current || orphanSweepInFlight.current) return;
    if (importJobs.some(job => job.status !== 'failed')) return;
    orphanSweepInFlight.current = true;
    void runOrphanSweep()
      .then(ran => { orphanSweepStarted.current = ran; })
      .finally(() => { orphanSweepInFlight.current = false; });
  }, [importJobs, libraryStatus]);

  useEffect(() => {
    if (libraryStatus !== 'ready') return undefined;
    const stopAutosave = startDraftAutosave();
    const appStateSubscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'background' || nextState === 'inactive') {
        void flushDraft(DRAFT_FLUSH_TIMEOUT_MS);
      } else if (nextState === 'active') {
        void retryFailedDraft();
      }
    });
    return () => {
      appStateSubscription.remove();
      stopAutosave();
    };
  }, [libraryStatus]);
}
