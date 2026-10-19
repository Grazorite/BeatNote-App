import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LibraryPrefs, LibraryRecord } from '../../types/library';
import type { MigrationJournal } from '../../types/migration';
import {
  SAVED_PROJECT_VERSION,
  type LegacyStoredProject,
  type ProjectIndexRecord,
  type SavedProject,
  type SavedProjectSummary,
  type SongDraft,
} from '../../types/project';
import type { PlaybackQueue } from '../../types/queue';
import {
  validateLibraryPrefs,
  validateLibraryRecord,
  validateLegacyProjects,
  validateMigrationJournal,
  validatePlaybackQueue,
  validateProjectIndexRecord,
  validateSavedProject,
  validateSongDraft,
  type ValidationResult,
} from '../../utils/recordValidation';
import {
  enqueueWrite,
  markFamilyReadFailed,
  markFamilyReadSucceeded,
  markReadFailed,
  markReadSucceeded,
  PersistenceReadError,
  type PersistenceIssue,
  type PersistenceKeyFamily,
} from './persistencePipeline';

export const LIBRARY_KEY = 'beatnote.library.v1';
export const LIBRARY_PREFS_KEY = 'beatnote.library.prefs.v1';
export const QUEUE_KEY = 'beatnote.queue.v1';
export const MIGRATION_JOURNAL_KEY = 'beatnote.migration.v1';
export const PROJECT_INDEX_KEY = 'beatnote.projects.v2.index';
export const PROJECT_KEY_PREFIX = 'beatnote.project.v2.';
export const LEGACY_PROJECTS_KEY = 'beatnote_projects';

export interface RepositoryOptions {
  now?: () => number;
  availableBytes?: () => number | null | Promise<number | null>;
  onIssue?: (issue: PersistenceIssue) => void;
}

interface RecordDefinition<T> {
  key: string;
  family: PersistenceKeyFamily;
  label: string;
  validate: (value: unknown) => ValidationResult<T | null>;
}

const libraryDefinition: RecordDefinition<LibraryRecord> = {
  key: LIBRARY_KEY,
  family: 'library',
  label: 'your music library',
  validate: validateLibraryRecord,
};

const prefsDefinition: RecordDefinition<LibraryPrefs> = {
  key: LIBRARY_PREFS_KEY,
  family: 'prefs',
  label: 'library preferences',
  validate: validateLibraryPrefs,
};

const queueDefinition: RecordDefinition<PlaybackQueue> = {
  key: QUEUE_KEY,
  family: 'queue',
  label: 'the playback queue',
  validate: validatePlaybackQueue,
};

const journalDefinition: RecordDefinition<MigrationJournal> = {
  key: MIGRATION_JOURNAL_KEY,
  family: 'journal',
  label: 'migration progress',
  validate: validateMigrationJournal,
};

const legacyProjectsDefinition: RecordDefinition<Record<string, LegacyStoredProject>> = {
  key: LEGACY_PROJECTS_KEY,
  family: 'project',
  label: 'legacy projects',
  validate: validateLegacyProjects,
};

async function reportReadFailure<T>(
  definition: RecordDefinition<T>,
  error: unknown,
  options: RepositoryOptions,
): Promise<void> {
  markReadFailed(definition.key);
  options.onIssue?.({
    kind: 'readFailed',
    label: definition.label,
    message: `BeatNote couldn't read ${definition.label}`,
    error,
    retry: async () => { await readRecord(definition, options); },
  });
}

async function readRecord<T>(
  definition: RecordDefinition<T>,
  options: RepositoryOptions = {},
  throwOnReadFailure = false,
  throwOnInvalid = throwOnReadFailure,
  onInvalid?: (invalidIds: readonly string[]) => void,
): Promise<T | null> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(definition.key);
  } catch (error) {
    await reportReadFailure(definition, error, options);
    if (throwOnReadFailure) throw new PersistenceReadError(definition.label, error);
    return null;
  }

  if (raw === null) {
    markReadSucceeded(definition.key);
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    const corruptKey = `${definition.key}_corrupt_${(options.now ?? Date.now)()}`;
    try {
      await AsyncStorage.setItem(corruptKey, raw);
    } catch (quarantineError) {
      console.error(`Failed to quarantine corrupt value for ${definition.key}`, quarantineError);
    }
    await reportReadFailure(definition, error, options);
    if (throwOnReadFailure) throw new PersistenceReadError(definition.label, error);
    return null;
  }

  const result = definition.validate(parsed);
  if (result.invalidIds.length > 0) {
    onInvalid?.(result.invalidIds);
    console.warn(`Ignored invalid ${definition.label} records`, result.invalidIds);
    markReadFailed(definition.key);
    if (throwOnInvalid) {
      const error = new Error(`Invalid ${definition.label}`);
      options.onIssue?.({
        kind: 'readFailed',
        label: definition.label,
        message: `BeatNote couldn't read ${definition.label}`,
        error,
        retry: async () => { await readRecord(definition, options, true); },
      });
      throw new PersistenceReadError(definition.label, error);
    }
  } else {
    markReadSucceeded(definition.key);
  }
  return result.valid;
}

function writeRecord<T>(
  definition: RecordDefinition<T>,
  value: T,
  options: RepositoryOptions = {},
  coalesceKey?: string,
): Promise<void> {
  return enqueueWrite({
    label: definition.label,
    family: definition.family,
    targetKeys: [definition.key],
    coalesceKey,
    availableBytes: options.availableBytes,
    onIssue: options.onIssue,
    run: () => AsyncStorage.setItem(definition.key, JSON.stringify(value)),
  });
}

export const readLibrary = (options?: RepositoryOptions) => readRecord(libraryDefinition, options);
export const readLibraryStrict = (options?: RepositoryOptions) => (
  readRecord(libraryDefinition, options, true)
);
export const writeLibrary = (value: LibraryRecord, options?: RepositoryOptions) => (
  writeRecord(libraryDefinition, value, options)
);

export interface LibraryMutation<T> {
  library: LibraryRecord;
  result: T;
}

/** Serialise a whole-record library read/modify/write so concurrent edits cannot be lost. */
export async function mutateLibrary<T>(
  mutate: (current: LibraryRecord | null) => LibraryMutation<T> | Promise<LibraryMutation<T>>,
  options: RepositoryOptions = {},
): Promise<T> {
  let result: T | undefined;
  await enqueueWrite({
    label: libraryDefinition.label,
    family: libraryDefinition.family,
    targetKeys: [libraryDefinition.key],
    availableBytes: options.availableBytes,
    onIssue: options.onIssue,
    run: async () => {
      const mutation = await mutate(await readRecord(libraryDefinition, options, true));
      await AsyncStorage.setItem(libraryDefinition.key, JSON.stringify(mutation.library));
      result = mutation.result;
    },
  });
  return result as T;
}
export const readLibraryPrefs = (options?: RepositoryOptions) => readRecord(prefsDefinition, options);
export const readLibraryPrefsStrict = (options?: RepositoryOptions) => (
  readRecord(prefsDefinition, options, true)
);
export const writeLibraryPrefs = (value: LibraryPrefs, options?: RepositoryOptions) => (
  writeRecord(prefsDefinition, value, options)
);
export const readQueue = (options?: RepositoryOptions) => readRecord(queueDefinition, options);
export const readQueueStrict = (options?: RepositoryOptions) => (
  readRecord(queueDefinition, options, true)
);
export const writeQueue = (
  value: PlaybackQueue | null,
  options: RepositoryOptions = {},
): Promise<void> => enqueueWrite({
  label: queueDefinition.label,
  family: queueDefinition.family,
  targetKeys: [queueDefinition.key],
  availableBytes: options.availableBytes,
  onIssue: options.onIssue,
  run: () => value === null
    ? AsyncStorage.removeItem(queueDefinition.key)
    : AsyncStorage.setItem(queueDefinition.key, JSON.stringify(value)),
});
export const readMigrationJournal = (options?: RepositoryOptions) => (
  readRecord(journalDefinition, options)
);
export const readMigrationJournalStrict = (options?: RepositoryOptions) => (
  readRecord(journalDefinition, options, true)
);
export const writeMigrationJournal = (value: MigrationJournal, options?: RepositoryOptions) => (
  writeRecord(journalDefinition, value, options)
);
export const readLegacyProjects = (options?: RepositoryOptions) => (
  readRecord(legacyProjectsDefinition, options, true, false)
);

export const draftKey = (musicItemId: string): string => (
  `beatnote.draft.v1.${musicItemId}`
);

const draftDefinition = (musicItemId: string): RecordDefinition<SongDraft> => ({
  key: draftKey(musicItemId),
  family: 'draft',
  label: `the draft for ${musicItemId}`,
  validate: value => validateSongDraft(value, musicItemId),
});

export const readDraft = (musicItemId: string, options?: RepositoryOptions) => (
  readRecord(draftDefinition(musicItemId), options)
);
export const writeDraft = (
  musicItemId: string,
  draft: SongDraft,
  options?: RepositoryOptions,
): Promise<void> => {
  if (draft.musicItemId !== musicItemId) {
    return Promise.reject(new Error('Draft music item ID does not match its storage key'));
  }
  return writeRecord(draftDefinition(musicItemId), draft, options, `draft:${musicItemId}`);
};

/**
 * Enqueue a coalescible draft write whose value is captured only when the
 * persistence pipeline begins the operation. Returning null skips storage.
 */
export const writeDraftSnapshot = (
  musicItemId: string,
  snapshot: () => SongDraft | null,
  onCommitted: (draft: SongDraft | null) => void,
  options: RepositoryOptions = {},
): Promise<void> => {
  const definition = draftDefinition(musicItemId);
  return enqueueWrite({
    label: definition.label,
    family: definition.family,
    targetKeys: [definition.key],
    coalesceKey: `draft:${musicItemId}`,
    availableBytes: options.availableBytes,
    onIssue: options.onIssue,
    run: async () => {
      const draft = snapshot();
      if (draft === null) {
        onCommitted(null);
        return;
      }
      if (draft.musicItemId !== musicItemId) {
        throw new Error('Draft music item ID does not match its storage key');
      }
      await AsyncStorage.setItem(definition.key, JSON.stringify(draft));
      onCommitted(draft);
    },
  });
};

export const projectKey = (projectId: string): string => `${PROJECT_KEY_PREFIX}${projectId}`;

const projectDefinition = (projectId: string): RecordDefinition<SavedProject> => ({
  key: projectKey(projectId),
  family: 'project',
  label: `project ${projectId}`,
  validate: value => validateSavedProject(value, projectId),
});

const projectIndexDefinition: RecordDefinition<ProjectIndexRecord> = {
  key: PROJECT_INDEX_KEY,
  family: 'projectIndex',
  label: 'the project index',
  validate: validateProjectIndexRecord,
};

const compareVersions = (left: string, right: string): number => {
  const parse = (version: string): number[] => version
    .split('.')
    .slice(0, 3)
    .map(part => Number.parseInt(part, 10) || 0);
  const leftParts = parse(left);
  const rightParts = parse(right);
  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] !== rightParts[index]) return leftParts[index] - rightParts[index];
  }
  return 0;
};

export const toProjectSummary = (project: SavedProject): SavedProjectSummary => ({
  projectId: project.projectId,
  musicItemId: project.musicItemId,
  name: project.metadata.name,
  revision: project.revision,
  modifiedAt: project.metadata.modifiedAt,
  markerCount: project.layers.reduce((count, layer) => count + layer.markers.length, 0),
  version: project.version,
  readOnly: compareVersions(project.version, SAVED_PROJECT_VERSION) > 0,
});

const emptyProjectIndex = (): ProjectIndexRecord => ({ schemaVersion: 1, projects: {} });

const projectIndexWith = (
  index: ProjectIndexRecord,
  project: SavedProject,
): ProjectIndexRecord => ({
  schemaVersion: 1,
  projects: { ...index.projects, [project.projectId]: toProjectSummary(project) },
});

const projectIndexWithout = (
  index: ProjectIndexRecord,
  projectId: string,
): ProjectIndexRecord => {
  const projects = { ...index.projects };
  delete projects[projectId];
  return { schemaVersion: 1, projects };
};

const readIndexForMutation = async (options: RepositoryOptions): Promise<ProjectIndexRecord> => (
  await readRecord(projectIndexDefinition, options, true) ?? emptyProjectIndex()
);

export type ProjectDraftMutation<T> =
  | { kind: 'noWrite'; result: T }
  | { kind: 'write'; project: SavedProject; draft: SongDraft; result: T };

/** Re-read and save a project plus its baseline draft in one serialized pipeline operation. */
export async function mutateProjectAndDraft<T>(
  projectId: string,
  musicItemId: string,
  decide: (
    stored: SavedProject | null,
    index: ProjectIndexRecord,
  ) => ProjectDraftMutation<T> | Promise<ProjectDraftMutation<T>>,
  options: RepositoryOptions = {},
): Promise<T> {
  let result: T | undefined;
  let pendingWrite: Extract<ProjectDraftMutation<T>, { kind: 'write' }> | null = null;
  await enqueueWrite({
    label: `project ${projectId}`,
    family: 'project',
    targetKeys: [projectKey(projectId), PROJECT_INDEX_KEY, draftKey(musicItemId)],
    availableBytes: options.availableBytes,
    onIssue: options.onIssue,
    run: async () => {
      const stored = await readRecord(projectDefinition(projectId), options, true);
      const index = await readIndexForMutation(options);
      const mutation = pendingWrite !== null
        && stored !== null
        && JSON.stringify(stored) === JSON.stringify(pendingWrite.project)
        ? pendingWrite
        : await decide(stored, index);
      result = mutation.result;
      if (mutation.kind === 'noWrite') return;
      pendingWrite = mutation;

      if (mutation.project.projectId !== projectId
        || mutation.project.musicItemId !== musicItemId
        || mutation.draft.musicItemId !== musicItemId) {
        throw new Error('Project save identity does not match its storage keys');
      }
      if (validateSavedProject(mutation.project, projectId).valid === null) {
        throw new Error('Invalid saved project');
      }
      if (validateSongDraft(mutation.draft, musicItemId).valid === null) {
        throw new Error('Invalid song draft');
      }

      await AsyncStorage.setItem(projectKey(projectId), JSON.stringify(mutation.project));
      await AsyncStorage.setItem(
        PROJECT_INDEX_KEY,
        JSON.stringify(projectIndexWith(index, mutation.project)),
      );
      await AsyncStorage.setItem(draftKey(musicItemId), JSON.stringify(mutation.draft));
    },
  });
  return result as T;
}

export const readProject = (projectId: string, options?: RepositoryOptions) => (
  readRecord(projectDefinition(projectId), options)
);

export async function writeProject(
  project: SavedProject,
  options: RepositoryOptions = {},
): Promise<void> {
  const validation = validateSavedProject(project, project.projectId);
  if (validation.valid === null) return Promise.reject(new Error('Invalid saved project'));
  const key = projectKey(project.projectId);
  return enqueueWrite({
    label: `project ${project.metadata.name}`,
    family: 'project',
    targetKeys: [key, PROJECT_INDEX_KEY],
    availableBytes: options.availableBytes,
    onIssue: options.onIssue,
    run: async () => {
      const index = await readIndexForMutation(options);
      await AsyncStorage.setItem(key, JSON.stringify(project));
      await AsyncStorage.setItem(PROJECT_INDEX_KEY, JSON.stringify(projectIndexWith(index, project)));
    },
  });
}

export async function deleteProject(
  projectId: string,
  options: RepositoryOptions = {},
): Promise<void> {
  const key = projectKey(projectId);
  return enqueueWrite({
    label: `project ${projectId}`,
    family: 'project',
    targetKeys: [key, PROJECT_INDEX_KEY],
    availableBytes: options.availableBytes,
    onIssue: options.onIssue,
    run: async () => {
      const index = await readIndexForMutation(options);
      await AsyncStorage.removeItem(key);
      await AsyncStorage.setItem(PROJECT_INDEX_KEY, JSON.stringify(projectIndexWithout(index, projectId)));
    },
  });
}

export async function readStoredRevision(
  projectId: string,
  options: RepositoryOptions = {},
): Promise<number | null> {
  let revision: number | null = null;
  await enqueueWrite({
    label: `project ${projectId}`,
    family: 'project',
    targetKeys: [projectKey(projectId)],
    onIssue: options.onIssue,
    run: async () => {
      revision = (await readRecord(projectDefinition(projectId), options, true))?.revision ?? null;
    },
  });
  return revision;
}

const sameIndex = (left: ProjectIndexRecord, right: ProjectIndexRecord): boolean => (
  JSON.stringify(left) === JSON.stringify(right)
);

const projectReadOptions = (
  options: RepositoryOptions,
  retry: () => Promise<void>,
): RepositoryOptions => ({
  ...options,
  onIssue: issue => options.onIssue?.({ ...issue, retry }),
});

/** Load all project source records and repair the derived index after interrupted writes. */
export async function readProjectIndex(
  options: RepositoryOptions = {},
): Promise<ProjectIndexRecord | null> {
  const retry = async (): Promise<void> => { await readProjectIndex(options); };
  markFamilyReadFailed('project');
  markFamilyReadFailed('projectIndex');

  let keys: string[];
  try {
    keys = (await AsyncStorage.getAllKeys())
      .filter(key => key.startsWith(PROJECT_KEY_PREFIX))
      .sort();
  } catch (error) {
    options.onIssue?.({
      kind: 'readFailed',
      label: 'projects',
      message: "BeatNote couldn't read projects",
      error,
      retry,
    });
    return null;
  }

  const readOptions = projectReadOptions(options, retry);
  let storedIndex: ProjectIndexRecord;
  let indexNeedsRepair = false;
  try {
    storedIndex = await readRecord(
      projectIndexDefinition,
      readOptions,
      true,
      false,
      () => { indexNeedsRepair = true; },
    )
      ?? emptyProjectIndex();
  } catch {
    return null;
  }

  const projects: Record<string, SavedProjectSummary> = {};
  let projectReadFailed = false;
  for (const key of keys) {
    const projectId = key.slice(PROJECT_KEY_PREFIX.length);
    const project = await readRecord(projectDefinition(projectId), {
      ...readOptions,
      onIssue: issue => {
        projectReadFailed = true;
        readOptions.onIssue?.(issue);
      },
    });
    if (project !== null) projects[projectId] = toProjectSummary(project);
  }
  if (projectReadFailed) return null;
  const reconciled: ProjectIndexRecord = { schemaVersion: 1, projects };

  markReadSucceeded(PROJECT_INDEX_KEY);
  markFamilyReadSucceeded('project');
  markFamilyReadSucceeded('projectIndex');
  if (indexNeedsRepair || !sameIndex(storedIndex, reconciled)) {
    await writeRecord(projectIndexDefinition, reconciled, options);
  }
  return reconciled;
}
