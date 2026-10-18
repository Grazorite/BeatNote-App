import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LibraryPrefs, LibraryRecord } from '../../types/library';
import type { MigrationJournal } from '../../types/migration';
import type { SongDraft } from '../../types/project';
import type { PlaybackQueue } from '../../types/queue';
import {
  validateLibraryPrefs,
  validateLibraryRecord,
  validateMigrationJournal,
  validatePlaybackQueue,
  validateSongDraft,
  type ValidationResult,
} from '../../utils/recordValidation';
import {
  enqueueWrite,
  markReadFailed,
  markReadSucceeded,
  type PersistenceIssue,
  type PersistenceKeyFamily,
} from './persistencePipeline';

export const LIBRARY_KEY = 'beatnote.library.v1';
export const LIBRARY_PREFS_KEY = 'beatnote.library.prefs.v1';
export const QUEUE_KEY = 'beatnote.queue.v1';
export const MIGRATION_JOURNAL_KEY = 'beatnote.migration.v1';

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
): Promise<T | null> {
  let raw: string | null;
  try {
    raw = await AsyncStorage.getItem(definition.key);
  } catch (error) {
    await reportReadFailure(definition, error, options);
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
    return null;
  }

  const result = definition.validate(parsed);
  if (result.invalidIds.length > 0) {
    console.warn(`Ignored invalid ${definition.label} records`, result.invalidIds);
    markReadFailed(definition.key);
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
export const writeLibrary = (value: LibraryRecord, options?: RepositoryOptions) => (
  writeRecord(libraryDefinition, value, options)
);
export const readLibraryPrefs = (options?: RepositoryOptions) => readRecord(prefsDefinition, options);
export const writeLibraryPrefs = (value: LibraryPrefs, options?: RepositoryOptions) => (
  writeRecord(prefsDefinition, value, options)
);
export const readQueue = (options?: RepositoryOptions) => readRecord(queueDefinition, options);
export const writeQueue = (value: PlaybackQueue, options?: RepositoryOptions) => (
  writeRecord(queueDefinition, value, options)
);
export const readMigrationJournal = (options?: RepositoryOptions) => (
  readRecord(journalDefinition, options)
);
export const writeMigrationJournal = (value: MigrationJournal, options?: RepositoryOptions) => (
  writeRecord(journalDefinition, value, options)
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
